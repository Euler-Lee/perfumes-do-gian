import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function CartScreen({ navigation }: any) {
  const { items, total, count, loading, removeItem, updateQuantidade } = useCart();

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={colors.gold} size="large" /></View>
  );

  if (items.length === 0) return (
    <View style={s.emptyWrap}>
      <Text style={s.emptyTitle}>Seu carrinho está vazio</Text>
      <Text style={s.emptySub}>Explore nossas fragrâncias e adicione ao carrinho.</Text>
      <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('HomeTab')}>
        <Text style={s.emptyBtnTxt}>Ver catálogo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.root}>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <Text style={s.header}>{count} {count === 1 ? 'item' : 'itens'}</Text>
        }
        renderItem={({ item }) => {
          const p = item.perfumes;
          return (
            <View style={s.card}>
              <View style={s.cardBody}>
                <View style={[s.tipoDot, p?.tipo === 'arabe' ? s.dotArabe : s.dotImportado]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.nome}>{p?.nome ?? '—'}</Text>
                  <Text style={s.marca}>{p?.marca}</Text>
                  {p?.concentracao && <Text style={s.conc}>{p.concentracao} · {p?.volume_ml}ml</Text>}
                  <Text style={s.unitPrice}>
                    R$ {Number(p?.preco ?? 0).toFixed(2).replace('.', ',')} / un.
                  </Text>
                </View>
                <View style={s.qtyWrap}>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantidade(item.id, item.quantidade - 1)}>
                    <Text style={s.qtyBtnTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qty}>{item.quantidade}</Text>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantidade(item.id, item.quantidade + 1)}>
                    <Text style={s.qtyBtnTxt}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.cardFooter}>
                <Text style={s.subtotal}>
                  R$ {(Number(p?.preco ?? 0) * item.quantidade).toFixed(2).replace('.', ',')}
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={s.remove}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Rodapé fixo */}
      <View style={s.footer}>
        <View style={s.footerRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
        </View>
        <TouchableOpacity style={s.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={s.checkoutBtnTxt}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: colors.bg },
  emptyTitle:  { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 8 },
  emptySub:    { fontSize: fontSize.sm, color: colors.text2, textAlign: 'center', marginBottom: 24 },
  emptyBtn:    { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 28, paddingVertical: 12 },
  emptyBtnTxt: { color: colors.gold, fontWeight: fontWeight.bold, fontSize: fontSize.base },

  list:   { padding: space[4], paddingBottom: 20 },
  header: { fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.bold, letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space[3],
    borderWidth: 1, borderColor: colors.border, ...shadow.xs, overflow: 'hidden',
  },
  cardBody:   { flexDirection: 'row', alignItems: 'flex-start', padding: space[4], gap: 12 },
  tipoDot:    { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  dotArabe:   { backgroundColor: colors.arabe },
  dotImportado: { backgroundColor: colors.importado },
  nome:       { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1 },
  marca:      { fontSize: fontSize.sm, color: colors.text2, marginTop: 2 },
  conc:       { fontSize: fontSize.xs, color: colors.text3, marginTop: 2 },
  unitPrice:  { fontSize: fontSize.xs, color: colors.gold, marginTop: 4, fontWeight: fontWeight.semibold },

  qtyWrap: { alignItems: 'center', gap: 8 },
  qtyBtn:  { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  qtyBtnTxt: { color: colors.gold, fontSize: 16, fontWeight: fontWeight.bold, lineHeight: 18 },
  qty:     { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text1, minWidth: 24, textAlign: 'center' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: space[4], paddingVertical: 10,
    borderTopWidth: 1, borderColor: colors.border,
    backgroundColor: colors.card,
  },
  subtotal: { fontSize: fontSize.base, fontWeight: fontWeight.heavy, color: colors.primary },
  remove:   { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.semibold },

  footer: {
    backgroundColor: colors.surface, padding: space[4],
    borderTopWidth: 1, borderColor: colors.border,
    ...shadow.md,
  },
  footerRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel:    { fontSize: fontSize.base, color: colors.text2, fontWeight: fontWeight.semibold },
  totalValue:    { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.primary },
  checkoutBtn:   { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold },
  checkoutBtnTxt:{ color: colors.gold, fontSize: fontSize.base, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
});
