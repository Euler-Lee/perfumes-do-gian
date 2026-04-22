import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import GoldLoader from '../../components/GoldLoader';
import GoldBackground from '../../components/GoldBackground';
import ConfirmDialog from '../../components/ConfirmDialog';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';
import type { Perfume } from '../../lib/types';

type Props = { route: any; navigation: any };

export default function PerfumesListScreen({ route, navigation }: Props) {
  const categoriaId   = route.params?.categoriaId   as string | undefined;
  const categoriaNome = route.params?.categoriaNome as string | undefined;

  const [perfumes,   setPerfumes]   = useState<Perfume[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId,  setConfirmId]  = useState<string | null>(null);
  const [busca,      setBusca]      = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'arabe' | 'importado'>('todos');

  const filtrados = useMemo(() => perfumes.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.marca ?? '').toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo;
    return matchBusca && matchTipo;
  }), [perfumes, busca, filtroTipo]);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('perfumes').select('*, categorias(nome)').order('nome');
    if (categoriaId) query = query.eq('categoria_id', categoriaId);
    const { data } = await query;
    setPerfumes((data as Perfume[]) ?? []);
    setLoading(false);
  }, [categoriaId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    let query = supabase.from('perfumes').select('*, categorias(nome)').order('nome');
    if (categoriaId) query = query.eq('categoria_id', categoriaId);
    const { data } = await query;
    setPerfumes((data as Perfume[]) ?? []);
    setRefreshing(false);
  }, [categoriaId]);

  useFocusEffect(load);

  useEffect(() => {
    if (categoriaNome) navigation.setOptions({ title: categoriaNome });
  }, [categoriaNome]);

  if (loading) return <GoldLoader />;

  return (
    <View style={s.root}>
      <GoldBackground opacity={0.03} />
      <View style={s.searchWrap}>
        <TextInput
          style={s.search} value={busca} onChangeText={setBusca}
          placeholder="Buscar perfume ou marca..." placeholderTextColor={colors.text3}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filtro tipo */}
      <View style={s.filtros}>
        {(['todos', 'arabe', 'importado'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.filtroBtn, filtroTipo === t && s.filtroBtnSel]} onPress={() => setFiltroTipo(t)}>
            <Text style={[s.filtroTxt, filtroTipo === t && s.filtroTxtSel]}>
              {t === 'todos' ? 'Todos' : t === 'arabe' ? '🪔 Árabe' : '✈️ Importado'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.gold]} />}
        contentContainerStyle={filtrados.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🫙</Text>
            <Text style={s.emptyTitle}>{busca ? 'Nenhum resultado' : 'Nenhum perfume'}</Text>
            <Text style={s.emptySub}>{busca ? `Sem resultados para "${busca}"` : 'Adicione seu primeiro perfume.'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <TouchableOpacity
              style={s.cardContent}
              activeOpacity={0.8}
              onPress={() => { Haptics.selectionAsync(); navigation.navigate('PerfumeDetalhe', { perfumeId: item.id, perfumeNome: item.nome }); }}
            >
              <View style={[s.tipoBadge, item.tipo === 'arabe' ? s.tipoArabe : s.tipoImportado]}>
                <Text style={s.tipoTxt}>{item.tipo === 'arabe' ? '🪔' : '✈️'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.nome}>{item.nome}</Text>
                <View style={s.metaRow}>
                  {item.marca    && <Text style={s.meta}>{item.marca}</Text>}
                  {item.concentracao && <Text style={s.metaSep}>·</Text>}
                  {item.concentracao && <Text style={s.meta}>{item.concentracao}</Text>}
                </View>
                {(item as any).categorias?.nome && (
                  <Text style={s.catTag}>{(item as any).categorias.nome}</Text>
                )}
              </View>
              {item.preco != null && (
                <Text style={s.preco}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
              )}
            </TouchableOpacity>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn} onPress={() => { Haptics.selectionAsync(); navigation.navigate('PerfumeForm', { id: item.id }); }}>
                <Text style={s.editTxt}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setConfirmId(item.id); }}>
                <Text style={s.deleteTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={s.fab}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('PerfumeForm', categoriaId ? { categoriaId } : undefined); }}
      >
        <Text style={s.fabText}>+ Novo Perfume</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={confirmId !== null}
        title="Excluir perfume"
        message="Esta ação não pode ser desfeita."
        onConfirm={async () => {
          if (!confirmId) return;
          await supabase.from('perfumes').delete().eq('id', confirmId);
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
  emptyWrap:      { alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon:      { fontSize: 52, marginBottom: 16 },
  emptyTitle:     { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 8, textAlign: 'center' },
  emptySub:       { fontSize: fontSize.sm, color: colors.text2, textAlign: 'center', lineHeight: 22 },
  searchWrap:     { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[2] },
  search: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: fontSize.base, color: colors.text1, ...shadow.xs,
  },
  filtros:      { flexDirection: 'row', paddingHorizontal: space[4], gap: 8, marginBottom: 4 },
  filtroBtn:    { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  filtroBtnSel: { backgroundColor: colors.primary, borderColor: colors.gold },
  filtroTxt:    { fontSize: fontSize.sm, color: colors.text2, fontWeight: fontWeight.semibold },
  filtroTxtSel: { color: colors.goldLight },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space[3],
    flexDirection: 'row', alignItems: 'stretch',
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: space[4], gap: 12 },
  tipoBadge:   { width: 40, height: 40, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  tipoArabe:   { backgroundColor: colors.arabeBg },
  tipoImportado: { backgroundColor: colors.importadoBg },
  tipoTxt:     { fontSize: 20 },
  nome:        { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1 },
  metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta:        { fontSize: fontSize.sm, color: colors.text2 },
  metaSep:     { fontSize: fontSize.sm, color: colors.text3 },
  catTag:      { fontSize: fontSize.xs, color: colors.gold, fontWeight: fontWeight.semibold, marginTop: 3 },
  preco:       { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  actions:     { flexDirection: 'column' },
  editBtn:     { flex: 1, width: 48, justifyContent: 'center', alignItems: 'center' },
  editTxt:     { fontSize: 16 },
  deleteBtn:   { flex: 1, width: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dangerBg, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
  deleteTxt:   { color: colors.danger, fontWeight: fontWeight.bold, fontSize: 13 },
  fab: {
    margin: space[4], backgroundColor: colors.primary, borderRadius: radius.md,
    padding: space[4], alignItems: 'center', ...shadow.sm,
    borderWidth: 1, borderColor: colors.gold,
  },
  fabText: { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
