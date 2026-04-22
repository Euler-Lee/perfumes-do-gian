import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking,
} from "react-native";
import ConfirmDialog from "../../components/ConfirmDialog";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { colors, fontSize, fontWeight, radius, shadow, space } from "../../lib/theme";
import type { Pedido } from "../../lib/types";

const WHATSAPP = "5541988859797";

const STATUS_LABEL: Record<Pedido["status"], string> = {
  pendente:   "Aguardando confirmacao",
  confirmado: "Confirmado",
  enviado:    "A caminho",
  entregue:   "Entregue",
  cancelado:  "Cancelado",
};
const STATUS_COLOR: Record<Pedido["status"], string> = {
  pendente:   "#E8A020",
  confirmado: "#2A7AE4",
  enviado:    "#8B5CF6",
  entregue:   colors.success,
  cancelado:  colors.danger,
};
const STATUS_ICON: Record<Pedido["status"], any> = {
  pendente:   "schedule",
  confirmado: "check-circle",
  enviado:    "local-shipping",
  entregue:   "done-all",
  cancelado:  "cancel",
};

function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function ContaScreen() {
  const [email,       setEmail]       = useState("");
  const [nomeDisplay, setNomeDisplay] = useState("");
  const [membroDesde, setMembroDesde] = useState("");
  const [pedidos,     setPedidos]     = useState<Pedido[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [confirmSair, setConfirmSair] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = session.user;
        setEmail(user.email ?? "");
        setNomeDisplay(
          user.user_metadata?.full_name
          ?? user.user_metadata?.name
          ?? user.email?.split("@")[0]
          ?? "Cliente"
        );
        const d = new Date(user.created_at);
        setMembroDesde(d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
      }
      const { data, error } = await supabase
        .from("pedidos")
        .select("*, pedido_itens(*, perfumes(nome, marca, preco))")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      setPedidos((data as Pedido[]) ?? []);
    } catch (err) {
      console.error("[Conta] load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(load);

  const totalGasto    = pedidos.filter(p => p.status !== "cancelado").reduce((s, p) => s + Number(p.total), 0);
  const totalPedidos  = pedidos.length;
  const pedidosAtivos = pedidos.filter(p => p.status !== "entregue" && p.status !== "cancelado").length;

  function sair() {
    setConfirmSair(true);
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.gold} size="large" /></View>;
  }

  const iniciais = nomeDisplay.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

  return (
    <>
    <ConfirmDialog
      visible={confirmSair}
      title="Sair da conta"
      message="Tem certeza que deseja encerrar sua sessão?"
      confirmLabel="Sair"
      confirmDanger
      onConfirm={() => { setConfirmSair(false); supabase.auth.signOut(); }}
      onCancel={() => setConfirmSair(false)}
    />
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Perfil */}
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{iniciais || "?"}</Text>
        </View>
        <View style={s.profileInfo}>
          <Text style={s.nomeDisplay}>{nomeDisplay}</Text>
          <Text style={s.emailTxt} numberOfLines={1}>{email}</Text>
          {membroDesde ? (
            <View style={s.membroRow}>
              <MaterialIcons name="star" size={12} color={colors.gold} />
              <Text style={s.membroTxt}>Membro desde {membroDesde}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity style={s.sairBtn} onPress={sair} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statNum}>{totalPedidos}</Text>
          <Text style={s.statLbl}>Pedidos</Text>
        </View>
        <View style={[s.statCard, s.statCardMid]}>
          <Text style={s.statNum}>{pedidosAtivos}</Text>
          <Text style={s.statLbl}>Em aberto</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statNum, { fontSize: fontSize.md }]}>{brl(totalGasto)}</Text>
          <Text style={s.statLbl}>Investido</Text>
        </View>
      </View>

      {/* Acoes rapidas */}
      <View style={s.acoesCard}>
        <Text style={s.acoesTitle}>CENTRAL DO CLIENTE</Text>
        <TouchableOpacity
          style={s.acaoRow}
          activeOpacity={0.75}
          onPress={() => Linking.openURL("https://wa.me/" + WHATSAPP + "?text=Ol%C3%A1%2C+preciso+de+ajuda.")}
        >
          <View style={[s.acaoIcon, { backgroundColor: "#DCF8C6" }]}>
            <MaterialIcons name="chat" size={20} color="#25D366" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.acaoTitulo}>Falar com a loja</Text>
            <Text style={s.acaoSub}>Atendimento via WhatsApp</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.text3} />
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity
          style={s.acaoRow}
          activeOpacity={0.75}
          onPress={() => Linking.openURL("https://wa.me/" + WHATSAPP + "?text=Quero+acompanhar+meu+pedido.")}
        >
          <View style={[s.acaoIcon, { backgroundColor: colors.importadoBg }]}>
            <MaterialIcons name="local-shipping" size={20} color="#2A7AE4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.acaoTitulo}>Rastrear entrega</Text>
            <Text style={s.acaoSub}>Consulte o status do seu pedido</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.text3} />
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity
          style={s.acaoRow}
          activeOpacity={0.75}
          onPress={() => Linking.openURL("https://wa.me/" + WHATSAPP + "?text=Quero+trocar+ou+devolver+um+produto.")}
        >
          <View style={[s.acaoIcon, { backgroundColor: "#FDECEA" }]}>
            <MaterialIcons name="swap-horiz" size={20} color={colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.acaoTitulo}>Troca e devolucao</Text>
            <Text style={s.acaoSub}>Politica de 7 dias apos recebimento</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.text3} />
        </TouchableOpacity>
      </View>

      {/* Historico */}
      <Text style={s.histTitle}>HISTORICO DE PEDIDOS</Text>

      {pedidos.length === 0 ? (
        <View style={s.emptyWrap}>
          <MaterialIcons name="receipt-long" size={48} color={colors.border} />
          <Text style={s.emptyTxt}>Nenhum pedido ainda</Text>
          <Text style={s.emptySub}>Seus pedidos apareceram aqui apos a compra</Text>
        </View>
      ) : (
        pedidos.map(p => {
          const itens = (p as any).pedido_itens ?? [];
          const nItens = itens.reduce((s: number, i: any) => s + i.quantidade, 0);
          return (
            <View key={p.id} style={s.pedidoCard}>
              <View style={s.pedidoHeader}>
                <View>
                  <Text style={s.pedidoId}>Pedido #{p.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={s.pedidoData}>
                    {new Date(p.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[p.status] + "20" }]}>
                  <MaterialIcons name={STATUS_ICON[p.status]} size={13} color={STATUS_COLOR[p.status]} />
                  <Text style={[s.statusTxt, { color: STATUS_COLOR[p.status] }]}>
                    {STATUS_LABEL[p.status]}
                  </Text>
                </View>
              </View>
              {itens.slice(0, 3).map((item: any) => (
                <View key={item.id} style={s.itemRow}>
                  <View style={s.itemDot} />
                  <Text style={s.itemTxt} numberOfLines={1}>
                    {item.perfumes?.nome ?? "Perfume"} x{item.quantidade}
                  </Text>
                </View>
              ))}
              {itens.length > 3 && (
                <Text style={s.itemMore}>+{itens.length - 3} mais</Text>
              )}
              <View style={s.pedidoFooter}>
                <Text style={s.nItens}>{nItens} {nItens === 1 ? "item" : "itens"}</Text>
                <Text style={s.pedidoTotal}>{brl(Number(p.total))}</Text>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space[4], paddingTop: space[4], paddingBottom: 48 },
  center:  { flex: 1, justifyContent: "center", alignItems: "center" },

  profileCard: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    padding: space[5], flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: colors.goldBorder, ...shadow.sm, marginBottom: space[4],
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.gold, justifyContent: "center", alignItems: "center",
    borderWidth: 2.5, borderColor: colors.goldLight,
  },
  avatarTxt:   { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.primary },
  profileInfo: { flex: 1 },
  nomeDisplay: { fontSize: fontSize.base, fontWeight: fontWeight.heavy, color: "#FFFFFF", marginBottom: 2 },
  emailTxt:    { fontSize: fontSize.xs, color: "#A8B4C4", marginBottom: 4 },
  membroRow:   { flexDirection: "row", alignItems: "center", gap: 4 },
  membroTxt:   { fontSize: fontSize.xs, color: colors.goldLight, fontStyle: "italic" },
  sairBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, borderColor: colors.danger + "66",
    backgroundColor: colors.danger + "18",
  },

  statsRow:    { flexDirection: "row", gap: space[3], marginBottom: space[4] },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: space[4], alignItems: "center",
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  statCardMid: { borderColor: colors.goldBorder },
  statNum:  { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.primary, marginBottom: 2 },
  statLbl:  { fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.semibold, textAlign: "center" },

  acoesCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, marginBottom: space[4],
    overflow: "hidden", ...shadow.xs,
  },
  acoesTitle: {
    fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.bold,
    letterSpacing: 2.5, paddingHorizontal: space[4], paddingTop: space[4],
    paddingBottom: 12, textTransform: "uppercase",
  },
  acaoRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: space[4], paddingVertical: 14,
  },
  acaoIcon:   { width: 40, height: 40, borderRadius: radius.md, justifyContent: "center", alignItems: "center" },
  acaoTitulo: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text1 },
  acaoSub:    { fontSize: fontSize.xs, color: colors.text3, marginTop: 2 },
  divider:    { height: 1, backgroundColor: colors.border, marginHorizontal: space[4] },

  histTitle: {
    fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.bold,
    letterSpacing: 2.5, marginBottom: 12, textTransform: "uppercase",
  },

  emptyWrap: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyTxt:  { fontSize: fontSize.base, color: colors.text2, fontWeight: fontWeight.semibold },
  emptySub:  { fontSize: fontSize.sm, color: colors.text3, textAlign: "center" },

  pedidoCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: space[4], marginBottom: space[3],
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  pedidoHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 12,
  },
  pedidoId:   { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text1, letterSpacing: 0.5 },
  pedidoData: { fontSize: fontSize.xs, color: colors.text3, marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
  },
  statusTxt:  { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  itemRow:    { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  itemDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gold },
  itemTxt:    { flex: 1, fontSize: fontSize.sm, color: colors.text2 },
  itemMore:   { fontSize: fontSize.xs, color: colors.text3, marginLeft: 13, marginBottom: 4 },
  pedidoFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: colors.border,
  },
  nItens:      { fontSize: fontSize.xs, color: colors.text3 },
  pedidoTotal: { fontSize: fontSize.base, fontWeight: fontWeight.heavy, color: colors.primary },
});
