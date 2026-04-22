import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';
import { AMBIENTES } from '../../lib/types';
import type { Perfume, PerfumeUso } from '../../lib/types';

type Props = { route: any; navigation: any };

// ── Barra animada de uso ─────────────────────────────────────────
function BarraUso({ ambiente, percentual, cor, delay }: { ambiente: string; percentual: number; cor: string; delay: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: percentual,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [percentual]);

  const amb = AMBIENTES.find(a => a.key === ambiente);

  return (
    <View style={b.row}>
      <View style={b.labelWrap}>
        <Text style={b.icon}>{amb?.icon ?? '🫙'}</Text>
        <Text style={b.label} numberOfLines={1}>{amb?.label ?? ambiente}</Text>
      </View>
      <View style={b.barBg}>
        <Animated.View
          style={[
            b.barFill,
            {
              backgroundColor: cor,
              width: width.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
      <Text style={[b.pct, { color: cor }]}>{percentual.toFixed(0)}%</Text>
    </View>
  );
}

const b = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 160 },
  icon:      { fontSize: 16 },
  label:     { fontSize: fontSize.sm, color: colors.text1, fontWeight: fontWeight.semibold, flex: 1 },
  barBg:     { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  barFill:   { height: '100%', borderRadius: radius.full },
  pct:       { width: 38, textAlign: 'right', fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});

// ── Tela principal ────────────────────────────────────────────────
export default function PerfumeDetalheScreen({ route, navigation }: Props) {
  const perfumeId   = route.params?.perfumeId   as string;
  const perfumeNome = route.params?.perfumeNome as string;

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [usos,    setUsos]    = useState<PerfumeUso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: perfumeNome ?? 'Perfume' });
    async function load() {
      const [{ data: p }, { data: u }] = await Promise.all([
        supabase.from('perfumes').select('*, categorias(nome)').eq('id', perfumeId).single(),
        supabase.from('usos_perfume').select('*').eq('perfume_id', perfumeId).order('percentual', { ascending: false }),
      ]);
      setPerfume(p as Perfume);
      setUsos((u as PerfumeUso[]) ?? []);
      setLoading(false);
    }
    load();
  }, [perfumeId]);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.gold} size="large" /></View>;
  if (!perfume) return null;

  const tipoArabe = perfume.tipo === 'arabe';

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>

      {/* Header card */}
      <View style={s.headerCard}>
        <View style={[s.tipoPill, tipoArabe ? s.tipoArabe : s.tipoImportado]}>
          <Text style={s.tipoPillTxt}>{tipoArabe ? '🪔 Árabe / Inspirado' : '✈️ Importado'}</Text>
        </View>
        <Text style={s.nomeTxt}>{perfume.nome}</Text>
        {perfume.marca && <Text style={s.marcaTxt}>{perfume.marca}</Text>}

        <View style={s.detalhesRow}>
          {perfume.concentracao && (
            <View style={s.badge}><Text style={s.badgeTxt}>{perfume.concentracao}</Text></View>
          )}
          {perfume.familia_olfativa && (
            <View style={s.badge}><Text style={s.badgeTxt}>{perfume.familia_olfativa}</Text></View>
          )}
          {perfume.volume_ml && (
            <View style={s.badge}><Text style={s.badgeTxt}>{perfume.volume_ml}ml</Text></View>
          )}
        </View>

        {perfume.preco != null && (
          <Text style={s.preco}>R$ {Number(perfume.preco).toFixed(2).replace('.', ',')}</Text>
        )}

        {(perfume as any).categorias?.nome && (
          <Text style={s.catTag}>🗂️ {(perfume as any).categorias.nome}</Text>
        )}

        {perfume.descricao ? (
          <Text style={s.descricao}>{perfume.descricao}</Text>
        ) : null}
      </View>

      {/* Gráfico de uso por ambiente */}
      {usos.length > 0 && (
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>📊 Uso por Ambiente</Text>
          <Text style={s.chartSub}>Índice de adequação para cada ocasião</Text>
          <View style={s.chartArea}>
            {usos.map((u, i) => {
              const amb = AMBIENTES.find(a => a.key === u.ambiente);
              return (
                <BarraUso
                  key={u.id}
                  ambiente={u.ambiente}
                  percentual={u.percentual}
                  cor={amb?.cor ?? colors.gold}
                  delay={i * 80}
                />
              );
            })}
          </View>

          {/* Legenda do melhor uso */}
          {usos[0] && (
            <View style={s.destaque}>
              <Text style={s.destaqueIcon}>🏆</Text>
              <View>
                <Text style={s.destaqueTit}>Melhor para</Text>
                <Text style={s.destaqueSub}>
                  {AMBIENTES.find(a => a.key === usos[0].ambiente)?.label ?? usos[0].ambiente}
                  {' '}({usos[0].percentual.toFixed(0)}%)
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {usos.length === 0 && (
        <View style={s.semUsos}>
          <Text style={s.semUsosTxt}>Nenhum índice de uso cadastrado.</Text>
          <Text style={s.semUsosSub}>Edite o perfume para adicionar.</Text>
        </View>
      )}

      {/* Botão editar */}
      <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('PerfumeForm', { id: perfume.id })}>
        <Text style={s.editBtnTxt}>✏️  Editar este perfume</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: space[4], paddingBottom: 48 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerCard: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    padding: space[6], marginBottom: space[4],
    borderWidth: 1, borderColor: colors.goldBorder, ...shadow.md,
  },
  tipoPill: {
    alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: radius.full, marginBottom: 12,
  },
  tipoArabe:      { backgroundColor: colors.arabeBg },
  tipoImportado:  { backgroundColor: colors.importadoBg },
  tipoPillTxt:    { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.text1 },
  nomeTxt:        { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: '#FFFFFF', marginBottom: 4 },
  marcaTxt:       { fontSize: fontSize.base, color: colors.goldLight, marginBottom: 12 },
  detalhesRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge:          { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(200,169,81,0.4)' },
  badgeTxt:       { fontSize: fontSize.xs, color: colors.goldLight, fontWeight: fontWeight.semibold },
  preco:          { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.goldLight, marginBottom: 8 },
  catTag:         { fontSize: fontSize.sm, color: '#A0A8B8', marginBottom: 10 },
  descricao:      { fontSize: fontSize.sm, color: '#C8D0DC', lineHeight: 20, marginTop: 8, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 12 },

  chartCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: space[5], marginBottom: space[4],
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  chartTitle: { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.primary, marginBottom: 4 },
  chartSub:   { fontSize: fontSize.sm, color: colors.text3, marginBottom: 20 },
  chartArea:  { marginBottom: 8 },

  destaque: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.goldBg, borderRadius: radius.md, padding: 14,
    borderWidth: 1, borderColor: colors.goldBorder, marginTop: 8,
  },
  destaqueIcon: { fontSize: 28 },
  destaqueTit:  { fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.semibold, textTransform: 'uppercase' },
  destaqueSub:  { fontSize: fontSize.base, color: colors.primary, fontWeight: fontWeight.bold, marginTop: 2 },

  semUsos: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: space[5], alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, marginBottom: space[4],
  },
  semUsosTxt: { fontSize: fontSize.base, color: colors.text2, fontWeight: fontWeight.semibold },
  semUsosSub: { fontSize: fontSize.sm, color: colors.text3, marginTop: 4 },

  editBtn: {
    backgroundColor: 'transparent', borderRadius: radius.md, padding: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold,
  },
  editBtnTxt: { color: colors.gold, fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
