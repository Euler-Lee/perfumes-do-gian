import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { colors, fontSize, fontWeight, radius, shadow, space } from "../../lib/theme";
import { useCart } from "../../context/CartContext";
import type { Perfume } from "../../lib/types";

type Props = { route: any; navigation: any };

export default function PerfumeDetalheScreen({ route, navigation }: Props) {
  const perfumeId   = route.params?.perfumeId   as string;
  const perfumeNome = route.params?.perfumeNome as string;

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);

  const { addItem, items } = useCart();
  const itemCart = items.find(i => i.perfume_id === perfumeId);

  useEffect(() => {
    navigation.setOptions({ title: perfumeNome ?? "Perfume" });
    supabase.from("perfumes").select("*, categorias(nome)").eq("id", perfumeId).single()
      .then(({ data }) => { setPerfume(data as Perfume); setLoading(false); });
  }, [perfumeId]);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.gold} size="large" /></View>;
  if (!perfume) return null;

  const tipoArabe = perfume.tipo === "arabe";
  const estoqueOk = (perfume.estoque ?? 0) > 0;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>

      {/* Header card */}
      <View style={s.headerCard}>
        <View style={[s.tipoPill, tipoArabe ? s.tipoArabe : s.tipoImportado]}>
          <Text style={[s.tipoPillTxt, tipoArabe ? s.tipoArabeTxt : s.tipoImportadoTxt]}>
            {tipoArabe ? "ARABE / INSPIRADO" : "IMPORTADO"}
          </Text>
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
          <Text style={s.preco}>R$ {Number(perfume.preco).toFixed(2).replace(".", ",")}</Text>
        )}

        {(perfume as any).categorias?.nome && (
          <Text style={s.catTag}>{(perfume as any).categorias.nome}</Text>
        )}

        {perfume.descricao ? (
          <Text style={s.descricao}>{perfume.descricao}</Text>
        ) : null}
      </View>

      {/* Estoque */}
      {perfume.estoque != null && (
        <View style={[s.estoqueCard, !estoqueOk && s.estoqueCardOut]}>
          <MaterialIcons name={estoqueOk ? "check-circle" : "remove-circle"} size={20} color={estoqueOk ? "#27AE60" : colors.danger} />
          <Text style={[s.estoqueTxt, !estoqueOk && { color: colors.danger }]}>
            {!estoqueOk ? "Fora de estoque" : perfume.estoque! < 5 ? `Ultimo estoque: ${perfume.estoque} unidades` : `${perfume.estoque} unidades disponiveis`}
          </Text>
        </View>
      )}

      {/* Botao carrinho */}
      {estoqueOk && (
        itemCart ? (
          <TouchableOpacity style={s.btnCart} onPress={() => navigation.navigate("CarrinhoTab")} activeOpacity={0.85}>
            <MaterialIcons name="shopping-bag" size={22} color={colors.primary} />
            <Text style={s.btnCartTxt}>Ver Carrinho ({itemCart.quantidade}x)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.btnAdd} onPress={() => addItem(perfumeId)} activeOpacity={0.85}>
            <MaterialIcons name="add-shopping-cart" size={22} color={colors.goldLight} />
            <Text style={s.btnAddTxt}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        )
      )}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: space[4], paddingBottom: 48 },
  center:  { flex: 1, justifyContent: "center", alignItems: "center" },

  headerCard: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    padding: space[6], marginBottom: space[4],
    borderWidth: 1, borderColor: colors.goldBorder,
  },
  tipoPill: {
    alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: radius.full, marginBottom: 12,
  },
  tipoArabe:        { backgroundColor: colors.arabeBg },
  tipoImportado:    { backgroundColor: colors.importadoBg },
  tipoPillTxt:      { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  tipoArabeTxt:     { color: "#7B4A00" },
  tipoImportadoTxt: { color: "#004488" },
  nomeTxt:      { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: "#FFFFFF", marginBottom: 4 },
  marcaTxt:     { fontSize: fontSize.base, color: colors.goldLight, marginBottom: 12 },
  detalhesRow:  { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  badge:        { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(200,169,81,0.4)" },
  badgeTxt:     { fontSize: fontSize.xs, color: colors.goldLight, fontWeight: fontWeight.semibold },
  preco:        { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.goldLight, marginBottom: 8 },
  catTag:       { fontSize: fontSize.sm, color: "#A0A8B8", marginBottom: 10 },
  descricao:    { fontSize: fontSize.sm, color: "#C8D0DC", lineHeight: 20, marginTop: 8, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingTop: 12 },

  estoqueCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#EAF9EE", borderRadius: radius.md, padding: 14,
    borderWidth: 1, borderColor: "#A8E6BA", marginBottom: space[3],
  },
  estoqueCardOut: { backgroundColor: "#FDECEC", borderColor: "#F5B7B1" },
  estoqueTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: "#27AE60" },

  btnAdd: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: 18, borderWidth: 1.5, borderColor: colors.gold, marginBottom: space[3],
  },
  btnAddTxt: { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },

  btnCart: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.gold, borderRadius: radius.md,
    padding: 18, marginBottom: space[3],
  },
  btnCartTxt: { color: colors.primary, fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
