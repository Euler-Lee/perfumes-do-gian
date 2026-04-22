import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import GoldLoader from "../../components/GoldLoader";
import { colors, fontSize, fontWeight, radius, shadow, space } from "../../lib/theme";
import { useCart } from "../../context/CartContext";
import type { Perfume } from "../../lib/types";

type Props = { route: any; navigation: any };

export default function PerfumesListScreen({ route, navigation }: Props) {
  const categoriaId   = route.params?.categoriaId   as string | undefined;
  const categoriaNome = route.params?.categoriaNome as string | undefined;

  const [perfumes,   setPerfumes]   = useState<Perfume[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca,      setBusca]      = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "arabe" | "importado">("todos");

  const { addItem, items } = useCart();
  const inCart = useMemo(() => new Set(items.map(i => i.perfume_id)), [items]);

  const filtrados = useMemo(() => perfumes.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.marca ?? "").toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo;
    return matchBusca && matchTipo;
  }), [perfumes, busca, filtroTipo]);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("perfumes").select("*, categorias(nome)").order("nome");
    if (categoriaId) query = query.eq("categoria_id", categoriaId);
    const { data } = await query;
    setPerfumes((data as Perfume[]) ?? []);
    setLoading(false);
  }, [categoriaId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    let query = supabase.from("perfumes").select("*, categorias(nome)").order("nome");
    if (categoriaId) query = query.eq("categoria_id", categoriaId);
    const { data } = await query;
    setPerfumes((data as Perfume[]) ?? []);
    setRefreshing(false);
  }, [categoriaId]);

  useFocusEffect(useCallback(() => {
    if (categoriaNome) navigation.setOptions({ title: categoriaNome });
    load();
  }, [load, categoriaNome]));

  if (loading) return <GoldLoader />;

  return (
    <View style={s.root}>
      <View style={s.searchWrap}>
        <TextInput
          style={s.search} value={busca} onChangeText={setBusca}
          placeholder="Buscar perfume ou marca..." placeholderTextColor={colors.text3}
          clearButtonMode="while-editing"
        />
      </View>
      <View style={s.filtros}>
        {(["todos", "arabe", "importado"] as const).map(t => (
          <TouchableOpacity key={t} style={[s.filtroBtn, filtroTipo === t && s.filtroBtnSel]} onPress={() => setFiltroTipo(t)}>
            <Text style={[s.filtroTxt, filtroTipo === t && s.filtroTxtSel]}>
              {t === "todos" ? "Todos" : t === "arabe" ? "ARABE" : "IMPORTADO"}
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
            <MaterialIcons name="spa" size={52} color={colors.border} />
            <Text style={s.emptyTitle}>{busca ? "Nenhum resultado" : "Nenhum perfume"}</Text>
            <Text style={s.emptySub}>{busca ? `Sem resultados para "${busca}"` : "Catalogo em breve."}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("PerfumeDetalhe", { perfumeId: item.id, perfumeNome: item.nome })}
          >
            <View style={s.cardLeft}>
              <View style={[s.tipoBadge, item.tipo === "arabe" ? s.tipoArabe : s.tipoImportado]}>
                <Text style={[s.tipoTxt, item.tipo === "arabe" ? s.tipoArabeTxt : s.tipoImportadoTxt]}>
                  {item.tipo === "arabe" ? "ARABE" : "IMPORT."}
                </Text>
              </View>
              <Text style={s.nome} numberOfLines={2}>{item.nome}</Text>
              <View style={s.metaRow}>
                {item.marca && <Text style={s.meta}>{item.marca}</Text>}
                {item.concentracao && <Text style={s.metaSep}> - </Text>}
                {item.concentracao && <Text style={s.meta}>{item.concentracao}</Text>}
              </View>
              {(item as any).categorias?.nome && (
                <Text style={s.catTag}>{(item as any).categorias.nome}</Text>
              )}
            </View>
            <View style={s.cardRight}>
              {item.preco != null && (
                <Text style={s.preco}>R$ {Number(item.preco).toFixed(2).replace(".", ",")}</Text>
              )}
              <TouchableOpacity
                style={[s.addBtn, inCart.has(item.id) && s.addBtnSel]}
                onPress={() => addItem(item.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={inCart.has(item.id) ? "check" : "add-shopping-cart"}
                  size={18}
                  color={inCart.has(item.id) ? colors.primary : colors.goldLight}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.bg },
  list:           { padding: space[4], paddingBottom: 24 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: space[10] },
  emptyWrap:      { alignItems: "center", paddingHorizontal: 32, gap: 12 },
  emptyTitle:     { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text1, textAlign: "center" },
  emptySub:       { fontSize: fontSize.sm, color: colors.text2, textAlign: "center", lineHeight: 22 },
  searchWrap:     { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[2] },
  search: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: fontSize.base, color: colors.text1,
  },
  filtros:      { flexDirection: "row", paddingHorizontal: space[4], gap: 8, marginBottom: 4 },
  filtroBtn:    { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  filtroBtnSel: { backgroundColor: colors.primary, borderColor: colors.gold },
  filtroTxt:    { fontSize: fontSize.sm, color: colors.text2, fontWeight: fontWeight.semibold },
  filtroTxtSel: { color: colors.goldLight },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space[3],
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: colors.border,
    padding: space[4], gap: 12,
  },
  cardLeft:  { flex: 1, gap: 4 },
  cardRight: { alignItems: "flex-end", gap: 10 },
  tipoBadge: { alignSelf: "flex-start", paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.full },
  tipoArabe:        { backgroundColor: colors.arabeBg },
  tipoImportado:    { backgroundColor: colors.importadoBg },
  tipoTxt:          { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  tipoArabeTxt:     { color: "#7B4A00" },
  tipoImportadoTxt: { color: "#004488" },
  nome:    { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta:    { fontSize: fontSize.sm, color: colors.text2 },
  metaSep: { fontSize: fontSize.sm, color: colors.text3 },
  catTag:  { fontSize: fontSize.xs, color: colors.gold, fontWeight: fontWeight.semibold },
  preco:   { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  addBtn: {
    width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.primary,
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.gold,
  },
  addBtnSel: { backgroundColor: colors.gold },
});
