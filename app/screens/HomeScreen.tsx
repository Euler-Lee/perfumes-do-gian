import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Linking, Dimensions, FlatList,
} from 'react-native';
import { supabase } from '../lib/supabase';
import FragranceLoader from '../components/FragranceLoader';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../lib/theme';
import type { Perfume } from '../lib/types';

const { width: SW } = Dimensions.get('window');

const WHATSAPP_NUM = '5541988859797';

// Cards fixos de categoria — destaques visuais com gradiente/cor sólida
const CAT_CARDS = [
  {
    id: 'arabe',
    nome: 'Árabes',
    sub: 'Oud, ambar e especiarias do oriente',
    cor: '#3D1F0A',
    accent: '#D4956A',
    emoji: '🕌',
  },
  {
    id: 'importado',
    nome: 'Importados',
    sub: 'Alta perfumaria europeia e americana',
    cor: '#1B2438',
    accent: '#C8A951',
    emoji: '✈️',
  },
  {
    id: 'masculino',
    nome: 'Masculinos',
    sub: 'Madeiras, couro e notas frescas',
    cor: '#1A3028',
    accent: '#4CAF7D',
    emoji: '🌲',
  },
  {
    id: 'feminino',
    nome: 'Femininos',
    sub: 'Florais, frutados e almiscarados',
    cor: '#3D1530',
    accent: '#E17BB3',
    emoji: '🌸',
  },
  {
    id: 'unissex',
    nome: 'Unissex',
    sub: 'Para todos os estilos e ocasiões',
    cor: '#1C2540',
    accent: '#7B9CDF',
    emoji: '⚡',
  },
  {
    id: 'exclusivo',
    nome: 'Exclusivos',
    sub: 'Seleção especial curada pelo Gian',
    cor: '#2D1B00',
    accent: '#FFD700',
    emoji: '👑',
  },
];

export default function HomeScreen({ navigation }: any) {
  const [destaques, setDestaques] = useState<Perfume[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    supabase
      .from('perfumes')
      .select('*')
      .eq('destaque', true)
      .order('criado_em', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setDestaques((data as Perfume[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <FragranceLoader label="Carregando" />;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={s.hero}>
        <Image source={require('../assets/gian.png')} style={s.heroImg} resizeMode="cover" />
        <View style={s.heroOverlay}>
          <Text style={s.heroLabel}>PERFUMES DO GIAN</Text>
          <Text style={s.heroPhrase}>Que experiência{'\n'}vamos escolher hoje?</Text>
        </View>
      </View>

      {/* Categorias */}
      <Text style={s.secTitle}>CATEGORIAS</Text>
      <View style={s.grid}>
        {CAT_CARDS.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[s.catCard, { backgroundColor: cat.cor }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PerfumesTab', {
              screen: 'PerfumesList',
              params: { tipo: cat.id },
            })}
          >
            <Text style={s.catEmoji}>{cat.emoji}</Text>
            <Text style={[s.catNome, { color: cat.accent }]}>{cat.nome}</Text>
            <Text style={s.catDesc}>{cat.sub}</Text>
            <Text style={[s.catSeta, { color: cat.accent }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Destaques */}
      {destaques.length > 0 && (
        <>
          <Text style={s.secTitle}>EM DESTAQUE</Text>
          <FlatList
            data={destaques}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => p.id}
            contentContainerStyle={s.destaquesRow}
            renderItem={({ item: p }) => (
              <TouchableOpacity
                style={s.destaqueCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('PerfumesTab', {
                  screen: 'PerfumeDetalhe',
                  params: { perfumeId: p.id },
                })}
              >
                <View style={[s.destaqueImgWrap, p.tipo === 'arabe' ? s.destaqueImgArabe : s.destaqueImgImportado]}>
                  {p.foto_url
                    ? <Image source={{ uri: p.foto_url }} style={s.destaqueImg} resizeMode="cover" />
                    : <Text style={s.destaqueEmoji}>{p.tipo === 'arabe' ? '🕌' : '✈️'}</Text>
                  }
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                  <Text style={s.destaqueNome} numberOfLines={2}>{p.nome}</Text>
                  <Text style={s.destaqueMarca} numberOfLines={1}>{p.marca}</Text>
                  <Text style={s.destaquePreco}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(p.preco))}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* WhatsApp card */}
      <TouchableOpacity
        style={s.waCard}
        activeOpacity={0.85}
        onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_NUM}`)}
      >
        <View style={s.waLeft}>
          <Text style={s.waTitle}>Não encontrou o que precisa?</Text>
          <Text style={s.waSub}>Fale com o Gian pelo WhatsApp</Text>
        </View>
        <View style={s.waBtn}>
          <Text style={s.waBtnTxt}>Chamar</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const CARD_W = (SW - space[4] * 2 - space[3]) / 2;

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },

  hero: { width: '100%', height: 260, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,36,56,0.55)',
    justifyContent: 'flex-end',
    padding: space[5],
  },
  heroLabel: {
    fontSize: fontSize.xs,
    color: colors.goldLight,
    fontWeight: fontWeight.bold,
    letterSpacing: 3,
    marginBottom: 8,
  },
  heroPhrase: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: '#FFFFFF',
    lineHeight: 32,
    letterSpacing: 0.3,
  },

  secTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text3,
    letterSpacing: 2.5,
    marginTop: space[5],
    marginBottom: 14,
    marginHorizontal: space[4],
  },

  grid:    { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space[4], gap: space[3] },
  catCard: {
    width: CARD_W,
    borderRadius: radius.lg,
    minHeight: 140,
    padding: space[4],
    justifyContent: 'space-between',
    ...shadow.sm,
  },
  catEmoji: { fontSize: 26, marginBottom: 6 },
  catNome:  { fontSize: fontSize.base, fontWeight: fontWeight.heavy, lineHeight: 20 },
  catDesc:  { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4, lineHeight: 15, flexShrink: 1 },
  catSeta:  { fontSize: 22, fontWeight: fontWeight.bold, marginTop: 6, alignSelf: 'flex-end' },

  // Destaques horizontal
  destaquesRow: { paddingHorizontal: space[4], gap: space[3] },
  destaqueCard: {
    width: 160, backgroundColor: colors.surface,
    borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  destaqueImgWrap:     { height: 120, justifyContent: 'center', alignItems: 'center' },
  destaqueImgArabe:    { backgroundColor: colors.arabeBg },
  destaqueImgImportado:{ backgroundColor: colors.importadoBg },
  destaqueImg:  { width: '100%', height: '100%' },
  destaqueEmoji:{ fontSize: 44 },
  destaqueNome: { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.text1, lineHeight: 18 },
  destaqueMarca:{ fontSize: fontSize.xs, color: colors.text3, marginTop: 2 },
  destaquePreco:{ fontSize: fontSize.sm, fontWeight: fontWeight.black, color: colors.gold, marginTop: 6 },

  waCard: {
    flexDirection: 'row', alignItems: 'center',
    margin: space[4], marginTop: space[5],
    backgroundColor: '#075E54',
    borderRadius: radius.lg,
    padding: space[4],
    gap: 12,
    ...shadow.sm,
  },
  waLeft:   { flex: 1 },
  waTitle:  { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: '#FFFFFF' },
  waSub:    { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  waBtn:    { backgroundColor: '#25D366', borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 10 },
  waBtnTxt: { color: '#FFFFFF', fontWeight: fontWeight.bold, fontSize: fontSize.sm },
});

