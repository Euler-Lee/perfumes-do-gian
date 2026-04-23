import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Linking, Dimensions, FlatList, ImageBackground,
} from 'react-native';
import { supabase } from '../lib/supabase';
import FragranceLoader from '../components/FragranceLoader';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../lib/theme';
import type { Categoria, Perfume } from '../lib/types';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - space[4] * 2 - space[3]) / 2;
const WHATSAPP_NUM = '5541988859797';

export default function HomeScreen({ navigation }: any) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [destaques,  setDestaques]  = useState<Perfume[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('categorias').select('*').order('ordem'),
      supabase
        .from('perfumes')
        .select('id,nome,marca,tipo,preco,foto_url')
        .eq('destaque', true)
        .order('criado_em', { ascending: false })
        .limit(10),
    ]).then(([{ data: cats }, { data: prods }]) => {
      setCategorias((cats as Categoria[]) ?? []);
      setDestaques((prods as Perfume[]) ?? []);
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
            {cat.imagem_url ? (
              <ImageBackground
                source={{ uri: cat.imagem_url }}
                style={s.catBg}
                imageStyle={{ borderRadius: radius.lg }}
              >
                <View style={s.catOverlay}>
                  <Text style={s.catNome}>{cat.nome}</Text>
                  {cat.descricao ? <Text style={s.catDesc}>{cat.descricao}</Text> : null}
                  <Text style={s.catSeta}>›</Text>
                </View>
              </ImageBackground>
            ) : (
              <View style={s.catBg}>
                <View style={s.catOverlay}>
                  <Text style={s.catNome}>{cat.nome}</Text>
                  {cat.descricao ? <Text style={s.catDesc}>{cat.descricao}</Text> : null}
                  <Text style={s.catSeta}>›</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Em Destaque */}
      {destaques.length > 0 && (
        <>
          <Text style={s.secTitle}>EM DESTAQUE</Text>
          <FlatList
            data={destaques}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => p.id}
            contentContainerStyle={s.destaquesRow}
            renderItem={({ item: p }) => {
              const initials = p.nome
                .split(' ')
                .slice(0, 2)
                .map((w: string) => w[0])
                .join('')
                .toUpperCase();
              return (
                <TouchableOpacity
                  style={s.destaqueCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('PerfumesTab', {
                    screen: 'PerfumeDetalhe',
                    params: { perfumeId: p.id },
                  })}
                >
                  <View style={[s.destaqueImgWrap, p.tipo === 'arabe' ? s.destaqueArabe : s.destaqueImportado]}>
                    {p.foto_url
                      ? <Image source={{ uri: p.foto_url }} style={s.destaqueImg} resizeMode="cover" />
                      : (
                        <View style={s.destaqueInitialsWrap}>
                          <Text style={[s.destaqueInitials, { color: p.tipo === 'arabe' ? '#D4956A' : colors.gold }]}>
                            {initials}
                          </Text>
                          <View style={[s.destaqueAccentLine, { backgroundColor: p.tipo === 'arabe' ? '#D4956A' : colors.gold }]} />
                        </View>
                      )
                    }
                  </View>
                  <View style={s.destaquePadding}>
                    <Text style={s.destaqueNome} numberOfLines={2}>{p.nome}</Text>
                    <Text style={s.destaqueMarca} numberOfLines={1}>{p.marca}</Text>
                    <Text style={s.destaquePreco}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(p.preco))}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}

      {/* WhatsApp */}
      <TouchableOpacity
        style={s.waCard}
        activeOpacity={0.85}
        onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_NUM}`)}
      >
        <View style={s.waLeft}>
          <Text style={s.waTitle}>Não encontrou o que procura?</Text>
          <Text style={s.waSub}>Fale com o Gian pelo WhatsApp</Text>
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

  hero: { width: '100%', height: 260 },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,36,56,0.55)',
    justifyContent: 'flex-end',
    padding: space[5],
  },
  heroLabel: {
    fontSize: fontSize.xs, color: colors.goldLight,
    fontWeight: fontWeight.bold, letterSpacing: 3, marginBottom: 8,
  },
  heroPhrase: {
    fontSize: fontSize.xl, fontWeight: fontWeight.black,
    color: '#FFFFFF', lineHeight: 32, letterSpacing: 0.3,
  },

  secTitle: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.amber, letterSpacing: 2.5,
    marginTop: space[5], marginBottom: 14, marginHorizontal: space[4],
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space[4], gap: space[3] },

  catCard: {
    width: CARD_W, borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm,
  },
  catBg: {
    backgroundColor: colors.primary, borderRadius: radius.lg, minHeight: 148,
  },
  catOverlay: {
    flex: 1, minHeight: 148,
    backgroundColor: 'rgba(20,28,46,0.65)',
    borderRadius: radius.lg,
    padding: space[4],
    justifyContent: 'space-between',
  },
  catNome:  { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: '#FFFFFF', lineHeight: 19 },
  catDesc:  { fontSize: 11, color: 'rgba(240,225,195,0.80)', marginTop: 6, lineHeight: 15 },
  catSeta:  { fontSize: 20, color: colors.goldLight, fontWeight: fontWeight.bold, alignSelf: 'flex-end', marginTop: 8 },

  // Destaques
  destaquesRow: { paddingHorizontal: space[4], gap: space[3] },
  destaqueCard: {
    width: 158, backgroundColor: colors.surface,
    borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  destaqueImgWrap: { height: 118, justifyContent: 'center', alignItems: 'center' },
  destaqueArabe:   { backgroundColor: '#2E1608' },
  destaqueImportado: { backgroundColor: '#0F1929' },
  destaqueImg:     { width: '100%', height: '100%' },
  destaqueInitialsWrap: { alignItems: 'center', gap: 8 },
  destaqueInitials: {
    fontSize: 30, fontWeight: fontWeight.black, letterSpacing: 3,
  },
  destaqueAccentLine: { width: 28, height: 2, borderRadius: 1 },
  destaquePadding:  { padding: 10 },
  destaqueNome:  { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.text1, lineHeight: 18 },
  destaqueMarca: { fontSize: fontSize.xs, color: colors.text3, marginTop: 2 },
  destaquePreco: { fontSize: fontSize.sm, fontWeight: fontWeight.black, color: colors.amber, marginTop: 6 },

  waCard: {
    flexDirection: 'row', alignItems: 'center',
    margin: space[4], marginTop: space[5],
    backgroundColor: '#0A5C48',
    borderRadius: radius.lg, padding: space[4], gap: 12, ...shadow.sm,
  },
  waLeft:   { flex: 1 },
  waTitle:  { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: '#FFFFFF' },
  waSub:    { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
  waBtn:    { backgroundColor: '#25D366', borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 10 },
  waBtnTxt: { color: '#FFFFFF', fontWeight: fontWeight.bold, fontSize: fontSize.sm },
});


