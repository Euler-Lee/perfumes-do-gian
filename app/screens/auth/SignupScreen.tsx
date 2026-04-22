import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius } from '../../lib/theme';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [conf,  setConf]      = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !senha) { Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.'); return; }
    if (senha !== conf)           { Alert.alert('Atenção', 'As senhas não conferem.'); return; }
    if (senha.length < 6)         { Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
    setLoading(false);
    if (error) { Alert.alert('Erro ao criar conta', error.message); return; }
    Alert.alert('Conta criada!', 'Verifique seu e-mail para confirmar o cadastro e depois faça login.');
    navigation.navigate('Login');
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Image source={require('../../assets/gian.png')} style={s.logo} resizeMode="cover" />
          <Text style={s.brand}>Perfumes do Gian</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Criar conta</Text>

          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input} value={email} onChangeText={setEmail}
            placeholder="seu@email.com" placeholderTextColor={colors.text3}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
          />

          <Text style={s.label}>Senha</Text>
          <TextInput
            style={s.input} value={senha} onChangeText={setSenha}
            placeholder="mínimo 6 caracteres" placeholderTextColor={colors.text3}
            secureTextEntry
          />

          <Text style={s.label}>Confirmar senha</Text>
          <TextInput
            style={s.input} value={conf} onChangeText={setConf}
            placeholder="••••••••" placeholderTextColor={colors.text3}
            secureTextEntry
          />

          <TouchableOpacity style={s.btnPrimary} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrimaryTxt}>Criar conta</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Text style={s.btnSecondaryTxt}>Já tem conta? <Text style={s.link}>Entrar</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.primary },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  header:    { alignItems: 'center', marginBottom: 32 },
  logo:      { width: 72, height: 72, borderRadius: 36, marginBottom: 14, borderWidth: 2, borderColor: colors.goldBorder },
  brand:     { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.goldLight },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: 28, borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  cardTitle:       { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.primary, marginBottom: 20 },
  label:           { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text2, marginBottom: 6, marginTop: 14 },
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
