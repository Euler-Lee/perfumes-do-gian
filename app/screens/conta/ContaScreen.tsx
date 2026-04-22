import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';
import type { Pedido } from '../../lib/types';

const STATUS_LABEL: Record<Pedido['status'], string> = {
  pendente:   'Aguardando confirmação',
  confirmado: 'Confirmado',
  enviado:    'A caminho',
  entregue:   'Entregue',
  cancelado:  'Cancelado',
};

const STATUS_COLOR: Record<Pedido['status'], string> = {
  pendente:   '#E8A020',
  confirmado: '#2A7AE4',
  enviado:    '#8B5CF6',
  entregue:   colors.success,
  cancelado:  colors.danger,
};

export default function ContaScreen({ navigation }: any) {
  const [email,   setEmail]   = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setEmail(session.user.email ?? '');
    const { data } = await supabase
      .from('pedidos')
      .select('*, pedido_itens(*, perfumes(nome,marca))')
      .order('criado_em', { ascending: false });
    setPedidos((data as Pedido[]) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(load);

  async function sair() {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); },
      },
    ]);
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.gold} size="large" /></View>;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>

      {/* Perfil */}
      <View style={s.profileCard}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{email.charAt(0).toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.emailTxt} numberOfLines={1}>{email}</Text>
          <Text style={s.clienteTxt}>Cliente</Text>
        </View>
        <TouchableOpacity style={s.sairBtn} onPress={sair}>
          <Text style={s.sairTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Pedidos */}
      <Text style={s.secTitle}>MEUS PEDIDOS</Text>

      {pedidos.length === 0 && (
        <View style={s.emptyWrap}>
          <Text style={s.emptyTxt}>Nenhum pedido realizado ainda.</Text>
        </View>
      )}

      {pedidos.map(p => (
        <View key={p.id} style={s.pedidoCard}>
          <View style={s.pedidoHeader}>
            <Text style={s.pedidoId}>#{p.id.slice(0, 8).toUpperCase()}</Text>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[p.status] + '22' }]}>
              <Text style={[s.statusTxt, { color: STATUS_COLOR[p.status] }]}>
                {STATUS_LABEL[p.status]}
              </Text>
            </View>
          </View>
          <Text style={s.pedidoData}>
            {new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </Text>
          {(p as any).pedido_itens?.map((item: any) => (
            <Text key={item.id} style={s.itemTxt} numberOfLines={1}>
              · {item.perfumes?.nome} ×{item.quantidade}
            </Text>
          ))}
          <View style={s.pedidoFooter}>
            <Text style={s.pedidoTotal}>R$ {Number(p.total).toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>
      ))}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: space[4], paddingBottom: 40 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileCard: {
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: space[4],
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: space[5],
    borderWidth: 1, borderColor: colors.goldBorder, ...shadow.sm,
  },
  avatar:    { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.primary },
  emailTxt:  { fontSize: fontSize.sm, color: '#FFFFFF', fontWeight: fontWeight.semibold },
  clienteTxt:{ fontSize: fontSize.xs, color: colors.goldLight, marginTop: 2 },
  sairBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.danger },
  sairTxt:   { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  secTitle: { fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.bold, letterSpacing: 2.5, marginBottom: 12, textTransform: 'uppercase' },

  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyTxt:  { fontSize: fontSize.base, color: colors.text3 },

  pedidoCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: space[4], marginBottom: space[3],
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pedidoId:     { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text1, letterSpacing: 0.5 },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusTxt:    { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  pedidoData:   { fontSize: fontSize.xs, color: colors.text3, marginBottom: 8 },
  itemTxt:      { fontSize: fontSize.sm, color: colors.text2, marginBottom: 2 },
  pedidoFooter: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: colors.border, alignItems: 'flex-end' },
  pedidoTotal:  { fontSize: fontSize.base, fontWeight: fontWeight.heavy, color: colors.primary },
});
