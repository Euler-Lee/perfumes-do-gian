import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius } from '../../lib/theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha) { Alert.alert('Preencha e-mail e senha.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setLoading(false);
    if (error) Alert.alert('Erro ao entrar', error.message);
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Text style={s.logo}>🫙</Text>
          <Text style={s.brand}>Perfumes do Gian</Text>
          <Text style={s.tagline}>Seu acervo de fragrâncias</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Entrar</Text>

          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input} value={email} onChangeText={setEmail}
            placeholder="seu@email.com" placeholderTextColor={colors.text3}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
          />

          <Text style={s.label}>Senha</Text>
          <TextInput
            style={s.input} value={senha} onChangeText={setSenha}
            placeholder="••••••••" placeholderTextColor={colors.text3}
            secureTextEntry
          />

          <TouchableOpacity style={s.btnPrimary} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrimaryTxt}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('Signup')} activeOpacity={0.75}>
            <Text style={s.btnSecondaryTxt}>Não tem conta? <Text style={s.link}>Criar conta</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.primary },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  header:    { alignItems: 'center', marginBottom: 36 },
  logo:      { fontSize: 64, marginBottom: 12 },
  brand:     { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.goldLight, letterSpacing: 0.5 },
  tagline:   { fontSize: fontSize.sm, color: '#A0A8B8', marginTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: 28, borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.primary, marginBottom: 20 },
  label:     { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text2, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: 14, fontSize: fontSize.base, color: colors.text1, backgroundColor: '#FDFAF5',
  },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: 16, alignItems: 'center', marginTop: 24,
    borderWidth: 1.5, borderColor: colors.gold,
  },
  btnPrimaryTxt:   { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnSecondary:    { alignItems: 'center', marginTop: 18 },
  btnSecondaryTxt: { fontSize: fontSize.sm, color: colors.text3 },
  link:            { color: colors.gold, fontWeight: fontWeight.bold },
});
