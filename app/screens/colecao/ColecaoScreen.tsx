import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import GoldLoader from '../../components/GoldLoader';
import GoldBackground from '../../components/GoldBackground';
import ConfirmDialog from '../../components/ConfirmDialog';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';
import type { Colecao } from '../../lib/types';

export default function ColecaoScreen({ navigation }: any) {
  const [itens,     setItens]     = useState<Colecao[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [confirmId, setConfirmId]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('colecao')
      .select('*, perfumes(nome, marca, tipo, concentracao)')
      .order('criado_em', { ascending: false });
    setItens((data as Colecao[]) ?? []);
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from('colecao')
      .select('*, perfumes(nome, marca, tipo, concentracao)')
      .order('criado_em', { ascending: false });
    setItens((data as Colecao[]) ?? []);
    setRefreshing(false);
  }, []);

  useFocusEffect(load);

  async function toggleColecao(id: string, valor: boolean) {
    await supabase.from('colecao').update({ na_colecao: !valor }).eq('id', id);
    load();
  }

  if (loading) return <GoldLoader />;

  return (
    <View style={s.root}>
      <GoldBackground opacity={0.03} />
      <FlatList
        data={itens}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.gold]} />}
        contentContainerStyle={itens.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>💎</Text>
            <Text style={s.emptyTitle}>Coleção vazia</Text>
            <Text style={s.emptySub}>Adicione perfumes à sua coleção pessoal.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const p = (item as any).perfumes;
          const tipoArabe = p?.tipo === 'arabe';
          return (
            <View style={s.card}>
              <TouchableOpacity
                style={s.cardContent}
                activeOpacity={0.8}
                onPress={() => { Haptics.selectionAsync(); navigation.navigate('PerfumeDetalhe', { perfumeId: item.perfume_id, perfumeNome: p?.nome }); }}
              >
                <View style={[s.tipoIcon, tipoArabe ? s.tipoArabe : s.tipoImportado]}>
                  <Text style={s.tipoEmoji}>{tipoArabe ? '🪔' : '✈️'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.nome}>{p?.nome ?? '—'}</Text>
                  {p?.marca && <Text style={s.marca}>{p.marca}</Text>}
                  {p?.concentracao && <Text style={s.conc}>{p.concentracao}</Text>}
                  {item.quantidade > 1 && <Text style={s.qtd}>Quantidade: {item.quantidade}</Text>}
                  {item.notas ? <Text style={s.notas} numberOfLines={1}>{item.notas}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => { Haptics.selectionAsync(); toggleColecao(item.id, item.na_colecao); }}>
                  <View style={[s.statusBadge, item.na_colecao ? s.statusTem : s.statusNao]}>
                    <Text style={s.statusTxt}>{item.na_colecao ? '✓ Tenho' : '○ Quero'}</Text>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setConfirmId(item.id); }}>
                <Text style={s.deleteTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <ConfirmDialog
        visible={confirmId !== null}
        title="Remover da coleção"
        message="O perfume continuará cadastrado, apenas será removido da sua coleção."
        confirmLabel="Remover"
        onConfirm={async () => {
          if (!confirmId) return;
          await supabase.from('colecao').delete().eq('id', confirmId);
          setConfirmId(null);
          load();
        }}
        onCancel={() => setConfirmId(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.bg },
  list:           { padding: space[4], paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: space[10] },
  emptyWrap:      { alignItems: 'center' },
  emptyIcon:      { fontSize: 52, marginBottom: 16 },
  emptyTitle:     { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 8 },
  emptySub:       { fontSize: fontSize.sm, color: colors.text2, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space[3],
    flexDirection: 'row', alignItems: 'stretch',
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  cardContent:    { flex: 1, flexDirection: 'row', alignItems: 'center', padding: space[4], gap: 12 },
  tipoIcon:       { width: 40, height: 40, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  tipoArabe:      { backgroundColor: colors.arabeBg },
  tipoImportado:  { backgroundColor: colors.importadoBg },
  tipoEmoji:      { fontSize: 20 },
  nome:           { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1 },
  marca:          { fontSize: fontSize.sm, color: colors.text2, marginTop: 2 },
  conc:           { fontSize: fontSize.xs, color: colors.gold, fontWeight: fontWeight.semibold },
  qtd:            { fontSize: fontSize.xs, color: colors.text3, marginTop: 2 },
  notas:          { fontSize: fontSize.xs, color: colors.text3, marginTop: 2, fontStyle: 'italic' },
  statusBadge:    { paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.full, borderWidth: 1.5 },
  statusTem:      { backgroundColor: colors.goldBg, borderColor: colors.gold },
  statusNao:      { backgroundColor: colors.bg, borderColor: colors.border },
  statusTxt:      { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primary },
  deleteBtn:      { width: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dangerBg, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
  deleteTxt:      { color: colors.danger, fontWeight: fontWeight.bold, fontSize: 14 },
});
