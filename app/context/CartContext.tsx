import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemCarrinho } from '../lib/types';

type CartContextType = {
  items:    ItemCarrinho[];
  total:    number;
  count:    number;
  loading:  boolean;
  addItem:          (perfumeId: string) => Promise<void>;
  removeItem:       (itemId: string) => Promise<void>;
  updateQuantidade: (itemId: string, quantidade: number) => Promise<void>;
  clearCart:        () => Promise<void>;
  refresh:          () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items,   setItems]   = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('carrinho')
      .select('*, perfumes(id,nome,marca,preco,estoque,tipo,concentracao,volume_ml)')
      .order('criado_em');
    setItems((data as ItemCarrinho[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, []);

  const addItem = useCallback(async (perfumeId: string) => {
    const existing = items.find(i => i.perfume_id === perfumeId);
    if (existing) {
      await supabase.from('carrinho').update({ quantidade: existing.quantidade + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('carrinho').insert({ perfume_id: perfumeId, quantidade: 1 });
    }
    await refresh();
  }, [items, refresh]);

  const removeItem = useCallback(async (itemId: string) => {
    await supabase.from('carrinho').delete().eq('id', itemId);
    await refresh();
  }, [refresh]);

  const updateQuantidade = useCallback(async (itemId: string, quantidade: number) => {
    if (quantidade <= 0) {
      await supabase.from('carrinho').delete().eq('id', itemId);
    } else {
      await supabase.from('carrinho').update({ quantidade }).eq('id', itemId);
    }
    await refresh();
  }, [refresh]);

  const clearCart = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('carrinho').delete().eq('user_id', session.user.id);
    setItems([]);
  }, []);

  const total = items.reduce((acc, i) => acc + (i.perfumes?.preco ?? 0) * i.quantidade, 0);
  const count = items.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, total, count, loading, addItem, removeItem, updateQuantidade, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
