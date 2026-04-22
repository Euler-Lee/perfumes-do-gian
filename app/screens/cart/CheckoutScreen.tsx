import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

type Form = {
  nome:         string;
  telefone:     string;
  cep:          string;
  endereco:     string;
  cidade:       string;
  observacoes:  string;
};

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, clearCart } = useCart();
  const [form,    setForm]    = useState<Form>({ nome: '', telefone: '', cep: '', endereco: '', cidade: '', observacoes: '' });
  const [loading, setLoading] = useState(false);

  const set = (field: keyof Form) => (val: string) => setForm(f => ({ ...f, [field]: val }));

  async function confirmar() {
    if (!form.nome.trim() || !form.telefone.trim() || !form.endereco.trim() || !form.cidade.trim()) {
      Alert.alert('Dados incompletos', 'Preencha nome, telefone, endereço e cidade.');
      return;
    }
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    // Cria o pedido
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert({
        user_id:           session.user.id,
        status:            'pendente',
        total,
        nome_destinatario: form.nome,
        telefone:          form.telefone,
        cep:               form.cep,
        endereco:          form.endereco,
        cidade:            form.cidade,
        observacoes:       form.observacoes || null,
      })
      .select()
      .single();

    if (error || !pedido) {
      Alert.alert('Erro', 'Não foi possível criar o pedido. Tente novamente.');
      setLoading(false);
      return;
    }

    // Cria itens do pedido
    const itens = items.map(i => ({
      pedido_id:      pedido.id,
      perfume_id:     i.perfume_id,
      quantidade:     i.quantidade,
      preco_unitario: i.perfumes?.preco ?? 0,
    }));
    await supabase.from('pedido_itens').insert(itens);

    // Limpa carrinho
    await clearCart();
    setLoading(false);

    navigation.replace('Confirmacao', { pedidoId: pedido.id, total });
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

        {/* Resumo */}
        <Text style={s.secTitle}>RESUMO DO PEDIDO</Text>
        <View style={s.resumo}>
          {items.map(i => (
            <View key={i.id} style={s.resumoRow}>
              <Text style={s.resumoNome} numberOfLines={1}>{i.perfumes?.nome}</Text>
              <Text style={s.resumoQty}>×{i.quantidade}</Text>
              <Text style={s.resumoVal}>
                R$ {(Number(i.perfumes?.preco ?? 0) * i.quantidade).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLbl}>Total</Text>
            <Text style={s.totalVal}>R$ {total.toFixed(2).replace('.', ',')}</Text>
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
  wrap:  { borderBottomWidth: 1, borderColor: colors.border, marginBottom: 0 },
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
  textarea:{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },

  resumo: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
    padding: space[4], marginBottom: space[4],
  },
  resumoRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  resumoNome: { flex: 1, fontSize: fontSize.sm, color: colors.text1, fontWeight: fontWeight.semibold },
  resumoQty:  { fontSize: fontSize.sm, color: colors.text3 },
  resumoVal:  { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  totalRow:   { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' },
  totalLbl:   { fontSize: fontSize.base, color: colors.text2, fontWeight: fontWeight.semibold },
  totalVal:   { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.primary },

  btn:    { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold },
  btnTxt: { color: colors.gold, fontSize: fontSize.base, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
});
