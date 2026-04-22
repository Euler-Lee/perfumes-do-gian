import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../lib/theme';

export default function HomeScreen({ navigation }: any) {
  const [stats, setStats] = useState({ total: 0, arabes: 0, importados: 0, categorias: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: total },
        { count: arabes },
        { count: importados },
        { count: categorias },
      ] = await Promise.all([
        supabase.from('perfumes').select('*', { count: 'exact', head: true }),
        supabase.from('perfumes').select('*', { count: 'exact', head: true }).eq('tipo', 'arabe'),
        supabase.from('perfumes').select('*', { count: 'exact', head: true }).eq('tipo', 'importado'),
        supabase.from('categorias').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ total: total ?? 0, arabes: arabes ?? 0, importados: importados ?? 0, categorias: categorias ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>

      {/* Cabeçalho */}
      <View style={s.header}>
        <Text style={s.headerIcon}>🫙</Text>
        <Text style={s.headerTitle}>Perfumes do Gian</Text>
        <Text style={s.headerSub}>Seu acervo de fragrâncias</Text>
      </View>

      {/* Cards de estatísticas */}
      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginVertical: 32 }} />
      ) : (
        <View style={s.statsGrid}>
          <View style={[s.statCard, s.statTotal]}>
            <Text style={s.statNum}>{stats.total}</Text>
            <Text style={s.statLbl}>Perfumes</Text>
          </View>
          <View style={[s.statCard, s.statArabe]}>
            <Text style={s.statNum}>{stats.arabes}</Text>
            <Text style={s.statLbl}>🪔 Árabes</Text>
          </View>
          <View style={[s.statCard, s.statImportado]}>
            <Text style={s.statNum}>{stats.importados}</Text>
            <Text style={s.statLbl}>✈️ Importados</Text>
          </View>
          <View style={[s.statCard, s.statCat]}>
            <Text style={s.statNum}>{stats.categorias}</Text>
            <Text style={s.statLbl}>Categorias</Text>
          </View>
        </View>
      )}

      {/* Ações rápidas */}
      <Text style={s.secTitle}>Acesso rápido</Text>

      <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('CategoriasTab')}>
        <Text style={s.actionIcon}>🗂️</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.actionTitle}>Categorias</Text>
          <Text style={s.actionSub}>Explore por família olfativa</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('PerfumesTab')}>
        <Text style={s.actionIcon}>🫙</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.actionTitle}>Todos os Perfumes</Text>
          <Text style={s.actionSub}>Árabe e importados juntos</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('ColecaoTab')}>
        <Text style={s.actionIcon}>💎</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.actionTitle}>Minha Coleção</Text>
          <Text style={s.actionSub}>Perfumes que você tem ou quer</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: space[4], paddingBottom: 48 },

  header: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    padding: 28, alignItems: 'center', marginBottom: space[5],
    borderWidth: 1, borderColor: colors.goldBorder, ...shadow.md,
  },
  headerIcon:  { fontSize: 52, marginBottom: 10 },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: '#fff', letterSpacing: 0.5 },
  headerSub:   { fontSize: fontSize.sm, color: colors.goldLight, marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: space[5] },
  statCard:  { flex: 1, minWidth: '44%', borderRadius: radius.lg, padding: 18, alignItems: 'center', borderWidth: 1, ...shadow.xs },
  statTotal: { backgroundColor: colors.primary, borderColor: colors.goldBorder },
  statArabe: { backgroundColor: colors.arabeBg,  borderColor: colors.arabeBorder },
  statImportado: { backgroundColor: colors.importadoBg, borderColor: colors.importadoBorder },
  statCat:   { backgroundColor: colors.goldBg,   borderColor: colors.goldBorder },
  statNum:   { fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.goldLight },
  statLbl:   { fontSize: fontSize.sm, color: colors.goldLight, marginTop: 4, fontWeight: fontWeight.semibold },

  secTitle: { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.primary, marginBottom: 12 },

  actionCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', padding: space[4], marginBottom: 10,
    gap: 14, ...shadow.xs,
  },
  actionIcon:  { fontSize: 28 },
  actionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1 },
  actionSub:   { fontSize: fontSize.sm, color: colors.text3, marginTop: 2 },
  arrow:       { fontSize: 22, color: colors.gold, fontWeight: fontWeight.bold },
});
