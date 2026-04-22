import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Linking, Dimensions,
} from 'react-native';
import { supabase } from '../lib/supabase';
import ClockLoader from '../components/ClockLoader';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../lib/theme';
import type { Categoria } from '../lib/types';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - space[4] * 2 - space[3]) / 2;

const WHATSAPP_NUM = '5541988859797';

export default function HomeScreen({ navigation }: any) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    supabase.from('categorias').select('*').order('ordem').then(({ data }) => {
      setCategorias((data as Categoria[]) ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <ClockLoader label="Carregando catálogo" />;

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
        {categorias.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={s.catCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PerfumesTab', {
              screen: 'PerfumesList',
              params: { categoriaId: cat.id, categoriaNome: cat.nome },
            })}
          >
            <Text style={s.catNome}>{cat.nome}</Text>
            {cat.descricao && (
              <Text style={s.catDesc} numberOfLines={2}>{cat.descricao}</Text>
            )}
            <Text style={s.catSeta}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* WhatsApp card */}
      <TouchableOpacity
        style={s.waCard}
        activeOpacity={0.85}
        onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_NUM}`)}
      >
        <View style={s.waLeft}>
          <Text style={s.waTitle}>Não encontrou o que precisa?</Text>
          <Text style={s.waSub}>Nos chame no WhatsApp</Text>
        </View>
        <View style={s.waBtn}>
          <Text style={s.waBtnTxt}>Chamar</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

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
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: space[4],
    borderWidth: 1,
    borderColor: colors.goldBorder,
    ...shadow.sm,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  catNome:  { fontSize: fontSize.base, fontWeight: fontWeight.heavy, color: '#FFFFFF', lineHeight: 22 },
  catDesc:  { fontSize: fontSize.xs, color: '#9AAABB', marginTop: 6, lineHeight: 17 },
  catSeta:  { fontSize: 22, color: colors.gold, fontWeight: fontWeight.bold, marginTop: 8, alignSelf: 'flex-end' },

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

