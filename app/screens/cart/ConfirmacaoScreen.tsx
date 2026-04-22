import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fontSize, fontWeight, radius, space } from '../../lib/theme';

export default function ConfirmacaoScreen({ route, navigation }: any) {
  const total    = route.params?.total    as number;
  const pedidoId = route.params?.pedidoId as string;

  return (
    <View style={s.root}>
      <View style={s.card}>
        <View style={s.check}><Text style={s.checkTxt}>✓</Text></View>
        <Text style={s.title}>Pedido realizado!</Text>
        <Text style={s.sub}>Seu pedido foi recebido com sucesso.{'\n'}Entraremos em contato para confirmar.</Text>
        <Text style={s.total}>Total: R$ {Number(total).toFixed(2).replace('.', ',')}</Text>
        <Text style={s.id}>#{pedidoId?.slice(0, 8).toUpperCase()}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}>
        <Text style={s.btnTxt}>Voltar ao início</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btn2} onPress={() => navigation.navigate('ContaTab', { screen: 'Conta' })}>
        <Text style={s.btn2Txt}>Ver meus pedidos</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: space[5] },
  card: {
    backgroundColor: colors.primary, borderRadius: 20, padding: 32, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.goldBorder, marginBottom: space[4],
  },
  check:    { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkTxt: { fontSize: 28, color: colors.primary, fontWeight: fontWeight.black },
  title:    { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: '#FFFFFF', marginBottom: 12 },
  sub:      { fontSize: fontSize.sm, color: '#A0A8C0', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  total:    { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.goldLight, marginBottom: 6 },
  id:       { fontSize: fontSize.xs, color: colors.text3, letterSpacing: 2 },
  btn:  { backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold, marginBottom: 10 },
  btnTxt: { color: colors.gold, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btn2:  { padding: 14, alignItems: 'center' },
  btn2Txt: { color: colors.text2, fontSize: fontSize.base },
});
