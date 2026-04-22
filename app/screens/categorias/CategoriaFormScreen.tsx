import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import GoldBackground from '../../components/GoldBackground';
import SaveToast from '../../components/SaveToast';
import { colors, fontSize, fontWeight, radius, space } from '../../lib/theme';

const ICONES = ['🫙','🌹','🌸','🌊','🌿','🔥','❄️','🌙','☀️','🎩','💎','🏔️','🍂','🌾','🎋'];

export default function CategoriaFormScreen({ route, navigation }: any) {
  const editId: string | undefined = route.params?.id;

  const [nome,      setNome]      = useState('');
  const [descricao, setDescricao] = useState('');
  const [icone,     setIcone]     = useState('🫙');
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(!!editId);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar Categoria' : 'Nova Categoria' });
    if (!editId) return;
    supabase.from('categorias').select('*').eq('id', editId).single().then(({ data }) => {
      if (data) { setNome(data.nome); setDescricao(data.descricao ?? ''); setIcone(data.icone ?? '🫙'); }
      setFetching(false);
    });
  }, [editId]);

  async function handleSave() {
    if (!nome.trim()) { Alert.alert('Informe o nome da categoria.'); return; }
    setLoading(true);
    const payload = { nome: nome.trim(), descricao: descricao.trim() || null, icone };
    const { error } = editId
      ? await supabase.from('categorias').update(payload).eq('id', editId)
      : await supabase.from('categorias').insert(payload);
    setLoading(false);
    if (error) { Alert.alert('Erro', error.message); return; }
    setShowToast(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (fetching) return <View style={s.center}><ActivityIndicator color={colors.gold} /></View>;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GoldBackground opacity={0.03} />
      <SaveToast visible={showToast} />
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <Text style={s.label}>Ícone</Text>
        <View style={s.iconeGrid}>
          {ICONES.map(ic => (
            <TouchableOpacity
              key={ic}
              style={[s.iconeBtn, icone === ic && s.iconeBtnSel]}
              onPress={() => setIcone(ic)}
            >
              <Text style={s.iconeEmoji}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Nome *</Text>
        <TextInput style={s.input} value={nome} onChangeText={setNome}
          placeholder="Ex: Amadeirados, Florais..." placeholderTextColor={colors.text3} />

        <Text style={s.label}>Descrição</Text>
        <TextInput style={[s.input, s.inputMulti]} value={descricao} onChangeText={setDescricao}
          placeholder="Descreva esta categoria..." placeholderTextColor={colors.text3}
          multiline numberOfLines={3} textAlignVertical="top" />

        <TouchableOpacity style={s.btn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.goldLight} /> : <Text style={s.btnTxt}>Salvar</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: space[5], paddingBottom: 48 },
  label:     { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text2, marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: 14, fontSize: fontSize.base, color: colors.text1, backgroundColor: colors.surface,
  },
  inputMulti:  { minHeight: 90 },
  iconeGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconeBtn: {
    width: 50, height: 50, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
  },
  iconeBtnSel: { borderColor: colors.gold, backgroundColor: colors.goldBg },
  iconeEmoji:  { fontSize: 22 },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md, padding: 16,
    alignItems: 'center', marginTop: 32, borderWidth: 1.5, borderColor: colors.gold,
  },
  btnTxt: { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
