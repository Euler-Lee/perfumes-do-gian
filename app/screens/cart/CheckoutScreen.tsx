import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

type Pagamento = 'debito' | 'credito' | 'credito_2x' | 'credito_3x' | 'credito_4x';

type Form = {
  nome:         string;
  telefone:     string;
  cep:          string;
  endereco:     string;
  cidade:       string;
  observacoes:  string;
};

// Para 4x usamos tabela Price com juros 1.99% a.m. (fórmula HP/PMT)
// 2x e 3x sem juros (mercado: Pag/Stone/Cielo isentos até 3x)
function calcParcela(total: number, parcelas: number, taxaMensal: number): number {
  if (taxaMensal === 0) return total / parcelas;
  const i = taxaMensal;
  return total * (i * Math.pow(1 + i, parcelas)) / (Math.pow(1 + i, parcelas) - 1);
}

function brl(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

type PagOpt = {
  key:    Pagamento;
  icon:   keyof typeof MaterialIcons.glyphMap;
  label:  string;
  tag:    string;
  tagOk:  boolean;
  detail: (total: number) => string;
};

const PAGAMENTOS: PagOpt[] = [
  {
    key: 'debito', icon: 'credit-card', label: 'Débito',
    tag: 'Sem juros', tagOk: true,
    detail: (t) => `${brl(t)} à vista`,
  },
  {
    key: 'credito', icon: 'credit-card', label: 'Crédito à vista',
    tag: 'Sem juros', tagOk: true,
    detail: (t) => `${brl(t)} à vista`,
  },
  {
    key: 'credito_2x', icon: 'credit-card', label: 'Crédito 2×',
    tag: 'Sem juros', tagOk: true,
    detail: (t) => `2× de ${brl(calcParcela(t, 2, 0))} = ${brl(t)}`,
  },
  {
    key: 'credito_3x', icon: 'credit-card', label: 'Crédito 3×',
    tag: 'Sem juros', tagOk: true,
    detail: (t) => `3× de ${brl(calcParcela(t, 3, 0))} = ${brl(t)}`,
  },
  {
    key: 'credito_4x', icon: 'credit-card', label: 'Crédito 4×',
    tag: '1,99% a.m.', tagOk: false,
    detail: (t) => {
      const parc = calcParcela(t, 4, 0.0199);
      return `4× de ${brl(parc)} = ${brl(parc * 4)}`;
    },
  },
];

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, clearCart } = useCart();
  const [form,      setForm]      = useState<Form>({ nome: '', telefone: '', cep: '', endereco: '', cidade: '', observacoes: '' });
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [loading,   setLoading]   = useState(false);

  const set = (field: keyof Form) => (val: string) => setForm(f => ({ ...f, [field]: val }));

  async function confirmar() {
    if (!form.nome.trim() || !form.telefone.trim() || !form.endereco.trim() || !form.cidade.trim()) {
      Alert.alert('Dados incompletos', 'Preencha nome, telefone, endereço e cidade.');
      return;
    }
    if (!pagamento) {
      Alert.alert('Forma de pagamento', 'Selecione como deseja pagar.');
      return;
    }
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    // Total com juros se crédito 4x
    const opt = PAGAMENTOS.find(p => p.key === pagamento)!;
    const totalFinal = pagamento === 'credito_4x'
      ? calcParcela(total, 4, 0.0199) * 4
      : total;

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert({
        user_id:           session.user.id,
        status:            'pendente',
        total:             Math.round(totalFinal * 100) / 100,
        nome_destinatario: form.nome,
        telefone:          form.telefone,
        cep:               form.cep,
        endereco:          form.endereco,
        cidade:            form.cidade,
        observacoes:       form.observacoes || null,
        forma_pagamento:   pagamento,
      })
      .select()
      .single();

    if (error || !pedido) {
      Alert.alert('Erro', 'Não foi possível criar o pedido. Tente novamente.');
      setLoading(false);
      return;
    }

    const itens = items.map(i => ({
      pedido_id:      pedido.id,
      perfume_id:     i.perfume_id,
      quantidade:     i.quantidade,
      preco_unitario: i.perfumes?.preco ?? 0,
    }));
    await supabase.from('pedido_itens').insert(itens);
    await clearCart();
    setLoading(false);
    navigation.replace('Confirmacao', { pedidoId: pedido.id, total: totalFinal });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.root} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <Text style={s.secTitle}>DADOS DE ENTREGA</Text>
        <View style={s.card}>
          <Field label="Nome completo *" value={form.nome} onChangeText={set('nome')} placeholder="Seu nome" />
          <Field label="Telefone / WhatsApp *" value={form.telefone} onChangeText={set('telefone')} placeholder="(41) 99999-9999" keyboardType="phone-pad" />
          <Field label="CEP" value={form.cep} onChangeText={set('cep')} placeholder="00000-000" keyboardType="numeric" />
          <Field label="Endereço completo *" value={form.endereco} onChangeText={set('endereco')} placeholder="Rua, nº, complemento" />
          <Field label="Cidade *" value={form.cidade} onChangeText={set('cidade')} placeholder="Sua cidade" last />
        </View>

        <Text style={s.secTitle}>FORMA DE PAGAMENTO</Text>
        <View style={s.card}>
          {PAGAMENTOS.map((opt, idx) => {
            const sel = pagamento === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  s.pagRow,
                  idx < PAGAMENTOS.length - 1 && s.pagRowBorder,
                  sel && s.pagRowSel,
                ]}
                activeOpacity={0.75}
                onPress={() => setPagamento(opt.key)}
              >
                <View style={[s.pagRadio, sel && s.pagRadioSel]}>
                  {sel && <View style={s.pagRadioDot} />}
                </View>
                <View style={s.pagIconWrap}>
                  <MaterialIcons name={opt.icon} size={18} color={sel ? colors.gold : colors.text3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.pagLabel, sel && s.pagLabelSel]}>{opt.label}</Text>
                  <Text style={s.pagDetail}>{opt.detail(total)}</Text>
                </View>
                <View style={[s.pagTag, opt.tagOk ? s.pagTagOk : s.pagTagWarn]}>
                  <Text style={[s.pagTagTxt, opt.tagOk ? s.pagTagTxtOk : s.pagTagTxtWarn]}>{opt.tag}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.secTitle}>OBSERVAÇÕES</Text>
        <View style={[s.card, { marginBottom: space[5] }]}>
          <TextInput
            style={[s.input, s.textarea]}
            value={form.observacoes}
            onChangeText={set('observacoes')}
            placeholder="Alguma observação sobre o pedido? (opcional)"
            placeholderTextColor={colors.text3}
            multiline
            numberOfLines={3}
          />
        </View>

        <Text style={s.secTitle}>RESUMO DO PEDIDO</Text>
        <View style={s.resumo}>
          {items.map(i => (
            <View key={i.id} style={s.resumoRow}>
              <Text style={s.resumoNome} numberOfLines={1}>{i.perfumes?.nome}</Text>
              <Text style={s.resumoQty}>×{i.quantidade}</Text>
              <Text style={s.resumoVal}>
                {brl(Number(i.perfumes?.preco ?? 0) * i.quantidade)}
              </Text>
            </View>
          ))}
          {pagamento === 'credito_4x' && (
            <View style={s.juroRow}>
              <Text style={s.juroLbl}>Juros (1,99% a.m.)</Text>
              <Text style={s.juroVal}>
                + {brl(calcParcela(total, 4, 0.0199) * 4 - total)}
              </Text>
            </View>
          )}
          <View style={s.totalRow}>
            <Text style={s.totalLbl}>Total</Text>
            <Text style={s.totalVal}>
              {pagamento === 'credito_4x'
                ? brl(calcParcela(total, 4, 0.0199) * 4)
                : brl(total)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={confirmar} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.gold} />
            : <Text style={s.btnTxt}>Confirmar Pedido</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, last }: any) {
  return (
    <View style={!last && fi.wrap}>
      <Text style={fi.label}>{label}</Text>
      <TextInput
        style={fi.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        keyboardType={keyboardType ?? 'default'}
      />
    </View>
  );
}

const fi = StyleSheet.create({
  wrap:  { borderBottomWidth: 1, borderColor: colors.border },
  label: { fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.semibold, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4, marginTop: 14, paddingHorizontal: space[4] },
  input: { fontSize: fontSize.base, color: colors.text1, paddingHorizontal: space[4], paddingVertical: 10 },
});

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: space[4], paddingBottom: 40 },

  secTitle: { fontSize: fontSize.xs, color: colors.text3, fontWeight: fontWeight.bold, letterSpacing: 2.5, marginBottom: 10, marginTop: space[4], textTransform: 'uppercase' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow.xs,
  },
  input:   { fontSize: fontSize.base, color: colors.text1, paddingHorizontal: space[4], paddingVertical: 10 },
  textarea:{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12, paddingHorizontal: space[4] },

  // Pagamento
  pagRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: space[4], paddingVertical: 14,
  },
  pagRowBorder: { borderBottomWidth: 1, borderColor: colors.border },
  pagRowSel:    { backgroundColor: colors.goldBg },
  pagRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  pagRadioSel:  { borderColor: colors.gold },
  pagRadioDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
  pagIconWrap:  { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  pagLabel:     { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text1 },
  pagLabelSel:  { color: colors.primary, fontWeight: fontWeight.bold },
  pagDetail:    { fontSize: fontSize.xs, color: colors.text3, marginTop: 2 },
  pagTag:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  pagTagOk:     { backgroundColor: colors.successBg },
  pagTagWarn:   { backgroundColor: '#FFF3CD' },
  pagTagTxt:    { fontSize: 10, fontWeight: fontWeight.bold },
  pagTagTxtOk:  { color: colors.success },
  pagTagTxtWarn:{ color: '#856404' },

  resumo: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
    padding: space[4], marginBottom: space[4],
  },
  resumoRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  resumoNome: { flex: 1, fontSize: fontSize.sm, color: colors.text1, fontWeight: fontWeight.semibold },
  resumoQty:  { fontSize: fontSize.sm, color: colors.text3 },
  resumoVal:  { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  juroRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  juroLbl:    { fontSize: fontSize.xs, color: '#856404' },
  juroVal:    { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: '#856404' },
  totalRow:   { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' },
  totalLbl:   { fontSize: fontSize.base, color: colors.text2, fontWeight: fontWeight.semibold },
  totalVal:   { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.primary },

  btn:    { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold },
  btnTxt: { color: colors.gold, fontSize: fontSize.base, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
});
