import React, { useState, useCallback, useMemo } from 'react';
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
import type { Categoria } from '../../lib/types';

export default function CategoriasListScreen({ navigation }: any) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading,   setLoading]     = useState(true);
  const [refreshing,setRefreshing]  = useState(false);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [busca,     setBusca]       = useState('');

  const filtradas = useMemo(
    () => categorias.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase())),
    [categorias, busca]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categorias').select('*').order('nome');
    setCategorias((data as Categoria[]) ?? []);
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase.from('categorias').select('*').order('nome');
    setCategorias((data as Categoria[]) ?? []);
    setRefreshing(false);
  }, []);

  useFocusEffect(load);

  if (loading) return <GoldLoader />;

  return (
    <View style={s.root}>
      <GoldBackground opacity={0.03} />
      <View style={s.searchWrap}>
        <TextInput
          style={s.search} value={busca} onChangeText={setBusca}
          placeholder="Buscar categoria..." placeholderTextColor={colors.text3}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filtradas}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.gold]} />}
        contentContainerStyle={filtradas.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🗂️</Text>
            <Text style={s.emptyTitle}>{busca ? 'Nenhum resultado' : 'Nenhuma categoria'}</Text>
            <Text style={s.emptySub}>{busca ? `Sem resultados para "${busca}"` : 'Crie sua primeira categoria.'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.8}
            onPress={() => { Haptics.selectionAsync(); navigation.navigate('PerfumesList', { categoriaId: item.id, categoriaNome: item.nome }); }}
          >
            <View style={s.cardLeft}>
              <Text style={s.icone}>{item.icone ?? '🫙'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.nome}>{item.nome}</Text>
                {item.descricao ? <Text style={s.desc} numberOfLines={1}>{item.descricao}</Text> : null}
              </View>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn} onPress={() => { Haptics.selectionAsync(); navigation.navigate('CategoriaForm', { id: item.id }); }}>
                <Text style={s.editTxt}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setConfirmId(item.id); }}>
                <Text style={s.deleteTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={s.fab}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('CategoriaForm'); }}
      >
        <Text style={s.fabText}>+ Nova Categoria</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={confirmId !== null}
        title="Excluir categoria"
        message="Os perfumes desta categoria não serão excluídos, apenas a categoria."
        onConfirm={async () => {
          if (!confirmId) return;
          await supabase.from('categorias').delete().eq('id', confirmId);
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
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space[3],
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
    paddingLeft: space[4],
  },
  cardLeft:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: space[4] },
  icone:     { fontSize: 30 },
  nome:      { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1 },
  desc:      { fontSize: fontSize.sm, color: colors.text3, marginTop: 2 },
  actions:   { flexDirection: 'row' },
  editBtn:   { width: 48, height: '100%' as any, justifyContent: 'center', alignItems: 'center' },
  editTxt:   { fontSize: 16 },
  deleteBtn: { width: 48, height: '100%' as any, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dangerBg, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
  deleteTxt: { color: colors.danger, fontWeight: fontWeight.bold, fontSize: 14 },
  fab: {
    margin: space[4], backgroundColor: colors.primary, borderRadius: radius.md,
    padding: space[4], alignItems: 'center', ...shadow.sm,
    borderWidth: 1, borderColor: colors.gold,
  },
  fabText: { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
