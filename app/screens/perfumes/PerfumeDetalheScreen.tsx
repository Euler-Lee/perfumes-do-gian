import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { colors, fontSize, fontWeight, radius, shadow, space } from "../../lib/theme";
import { useCart } from "../../context/CartContext";
import type { Perfume } from "../../lib/types";

type Props = { route: any; navigation: any };

// ─── Formata BRL ─────────────────────────────────────────────────────────────
function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// ─── Barra de ocasiao animada ─────────────────────────────────────────────────
interface ScoreBarProps { label: string; value: number; color: string; delay: number }
function ScoreBar({ label, value, color, delay }: ScoreBarProps) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [value]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"], extrapolate: "clamp" });
  return (
    <View style={sb.row}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.track}>
        <Animated.View style={[sb.fill, { width, backgroundColor: color }]} />
      </View>
      <Text style={[sb.pct, { color }]}>{value}%</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
  label: { width: 100, fontSize: fontSize.sm, color: colors.text2, fontWeight: fontWeight.semibold },
  track: { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: radius.full, overflow: "hidden" },
  fill:  { height: "100%", borderRadius: radius.full },
  pct:   { width: 38, textAlign: "right", fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function PerfumeDetalheScreen({ route, navigation }: Props) {
  const perfumeId   = route.params?.perfumeId   as string;
  const perfumeNome = route.params?.perfumeNome as string;

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);

  const { addItem, items } = useCart();
  const itemCart = items.find(i => i.perfume_id === perfumeId);
  const estoqueOk = (perfume?.estoque ?? 0) > 0;

  useEffect(() => {
    navigation.setOptions({ title: perfumeNome ?? "Perfume" });
    (async () => {
      try {
        const { data, error } = await supabase
          .from("perfumes")
          .select("*, categorias(nome)")
          .eq("id", perfumeId)
          .single();
        if (error) throw error;
        setPerfume(data as Perfume);
      } catch (err) {
        console.error("[PerfumeDetalhe] load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [perfumeId]);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.gold} size="large" /></View>;
  if (!perfume) return null;

  const tipoArabe = perfume.tipo === "arabe";

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── Foto do frasco ── */}
      <View style={s.photoWrap}>
        {perfume.foto_url ? (
          <Image source={{ uri: perfume.foto_url }} style={s.photo} resizeMode="cover" />
        ) : (
          <View style={[s.photo, s.photoPlaceholder]}>
            <MaterialIcons name="spa" size={64} color={colors.goldBorder} />
          </View>
        )}
        <View style={s.photoOverlay} />
        <View style={[s.tipoPill, tipoArabe ? s.tipoArabe : s.tipoImportado]}>
          <Text style={[s.tipoPillTxt, tipoArabe ? s.tipoArabeTxt : s.tipoImportadoTxt]}>
            {tipoArabe ? "ARABE / INSPIRADO" : "IMPORTADO"}
          </Text>
        </View>
      </View>

      {/* ── Header info ── */}
      <View style={s.headerCard}>
        <Text style={s.nomeTxt}>{perfume.nome}</Text>
        {perfume.marca && <Text style={s.marcaTxt}>{perfume.marca}</Text>}
        <View style={s.badgesRow}>
          {perfume.concentracao    && <View style={s.badge}><Text style={s.badgeTxt}>{perfume.concentracao}</Text></View>}
          {perfume.familia_olfativa&& <View style={s.badge}><Text style={s.badgeTxt}>{perfume.familia_olfativa}</Text></View>}
          {perfume.volume_ml       && <View style={s.badge}><Text style={s.badgeTxt}>{perfume.volume_ml}ml</Text></View>}
        </View>
        {(perfume as any).categorias?.nome && (
          <Text style={s.catTag}>{(perfume as any).categorias.nome}</Text>
        )}
        {perfume.descricao && <Text style={s.descricao}>{perfume.descricao}</Text>}
      </View>

      {/* ── Preco + Carrinho ── */}
      <View style={s.compraCard}>
        <Text style={s.preco}>{brl(perfume.preco)}</Text>
        {perfume.estoque != null && (
          <Text style={[s.estoqueTxt, !estoqueOk && { color: colors.danger }]}>
            {!estoqueOk ? "Fora de estoque"
              : perfume.estoque < 5 ? `Ultimo estoque: ${perfume.estoque} un.`
              : `${perfume.estoque} unidades disponiveis`}
          </Text>
        )}
        {estoqueOk && (
          itemCart ? (
            <TouchableOpacity style={s.btnCart} onPress={() => navigation.navigate("CarrinhoTab")} activeOpacity={0.85}>
              <MaterialIcons name="shopping-bag" size={22} color={colors.primary} />
              <Text style={s.btnCartTxt}>Ver Carrinho ({itemCart.quantidade}x adicionado)</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.btnAdd} onPress={() => addItem(perfumeId)} activeOpacity={0.85}>
              <MaterialIcons name="add-shopping-cart" size={22} color={colors.goldLight} />
              <Text style={s.btnAddTxt}>Adicionar ao Carrinho</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* ── Painel de Ocasioes ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Painel de Ocasioes</Text>
        <Text style={s.cardSub}>Adequacao para cada contexto de uso</Text>
        <ScoreBar label="Casual"           value={perfume.score_casual}  color="#C8A951" delay={0}   />
        <ScoreBar label="Formal"           value={perfume.score_formal}  color="#3A5FA0" delay={100} />
        <ScoreBar label="Ao Ar Livre"      value={perfume.score_aberto}  color="#27AE60" delay={200} />
        <ScoreBar label="Amb. Fechados"    value={perfume.score_fechado} color="#8B5CF6" delay={300} />
      </View>

      {/* ── Equivalencia Olfativa ── */}
      {perfume.inspiracao && (
        <View style={s.inspiracaoCard}>
          <View style={s.inspiracaoHeader}>
            <MaterialIcons name="info-outline" size={18} color={colors.gold} />
            <Text style={s.inspiracaoTitle}>Equivalencia Olfativa</Text>
          </View>
          <Text style={s.inspiracaoTxt}>
            Esta fragancia e inspirada em{" "}
            <Text style={s.inspiracaoDestaque}>{perfume.inspiracao}</Text>, um dos perfumes mais
            aclamados do mundo. Uma opcao sofisticada e acessivel para quem aprecia esse estilo
            olfativo.
          </Text>
        </View>
      )}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },
  center:  { flex: 1, justifyContent: "center", alignItems: "center" },

  photoWrap:       { width: "100%", height: 280, position: "relative" },
  photo:           { width: "100%", height: "100%" },
  photoPlaceholder:{ backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  photoOverlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(27,36,56,0.35)" },
  tipoPill: {
    position: "absolute", bottom: 16, left: 16,
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.full,
  },
  tipoArabe:        { backgroundColor: colors.arabeBg },
  tipoImportado:    { backgroundColor: colors.importadoBg },
  tipoPillTxt:      { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  tipoArabeTxt:     { color: "#7B4A00" },
  tipoImportadoTxt: { color: "#004488" },

  headerCard: {
    backgroundColor: colors.primary, padding: space[5],
    borderBottomWidth: 1, borderColor: colors.goldBorder,
  },
  nomeTxt:   { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: "#FFFFFF", marginBottom: 4 },
  marcaTxt:  { fontSize: fontSize.base, color: colors.goldLight, marginBottom: 12 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  badge:     { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(200,169,81,0.4)" },
  badgeTxt:  { fontSize: fontSize.xs, color: colors.goldLight, fontWeight: fontWeight.semibold },
  catTag:    { fontSize: fontSize.sm, color: "#A0A8B8", marginBottom: 10 },
  descricao: { fontSize: fontSize.sm, color: "#C8D0DC", lineHeight: 20, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)" },

  compraCard: {
    backgroundColor: colors.surface, padding: space[5],
    borderBottomWidth: 1, borderColor: colors.border, gap: 12,
  },
  preco:      { fontSize: 28, fontWeight: fontWeight.black, color: colors.primary },
  estoqueTxt: { fontSize: fontSize.sm, color: "#27AE60", fontWeight: fontWeight.semibold },
  btnAdd: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: 16, borderWidth: 1.5, borderColor: colors.gold,
  },
  btnAddTxt:  { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnCart: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.gold, borderRadius: radius.md, padding: 16,
  },
  btnCartTxt: { color: colors.primary, fontSize: fontSize.base, fontWeight: fontWeight.bold },

  card: {
    backgroundColor: colors.surface, margin: space[4],
    borderRadius: radius.xl, padding: space[5],
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.primary, marginBottom: 4 },
  cardSub:   { fontSize: fontSize.sm, color: colors.text3, marginBottom: 20 },

  inspiracaoCard: {
    backgroundColor: colors.goldBg, marginHorizontal: space[4], marginBottom: space[4],
    borderRadius: radius.xl, padding: space[5],
    borderWidth: 1, borderColor: colors.goldBorder, ...shadow.xs,
  },
  inspiracaoHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  inspiracaoTitle:  { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.primary },
  inspiracaoTxt:    { fontSize: fontSize.sm, color: colors.text2, lineHeight: 21 },
  inspiracaoDestaque:{ fontWeight: fontWeight.bold, color: colors.primary },
});
