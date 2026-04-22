import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius } from '../../lib/theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading,setGLoading]= useState(false);

  // Quando a sessão for criada (via deep link no Android), para o loading
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') setGLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setLoading(false);
    if (error) Alert.alert('Erro ao entrar', error.message);
  }

  async function handleGoogle() {
    setGLoading(true);
    try {
      // path garante URL com host válido: pdg://auth-callback
      const redirectTo = makeRedirectUri({ scheme: 'pdg', path: 'auth-callback' });
      console.log('[Google OAuth] redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('URL OAuth não retornada pelo Supabase');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      console.log('[Google OAuth] result.type:', result.type);

      if (result.type === 'success' && result.url) {
        // iOS / alguns Androids: resultado direto no browser
        console.log('[Google OAuth] exchanging code from result.url');
        const { error: ex } = await supabase.auth.exchangeCodeForSession(result.url);
        if (ex) throw ex;
      }
      // Se result.type === 'dismiss': Android entregou via deep link
      // O handler em App.tsx chama exchangeCodeForSession automaticamente
      // O useEffect acima vai setar gLoading=false quando SIGNED_IN disparar

    } catch (err: any) {
      console.error('[Google OAuth] erro:', err);
      Alert.alert('Erro no login', err?.message ?? 'Tente novamente.');
      setGLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Image source={require('../../assets/gian.png')} style={s.logo} resizeMode="cover" />
          <Text style={s.brand}>Perfumes do Gian</Text>
          <Text style={s.tagline}>Fragrancias de alto padrao</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Entrar</Text>
          <TouchableOpacity style={s.btnGoogle} onPress={handleGoogle} disabled={gLoading} activeOpacity={0.85}>
            {gLoading ? <ActivityIndicator color={colors.text1} /> : <>
              <Text style={s.googleG}>G</Text>
              <Text style={s.btnGoogleTxt}>Continuar com Google</Text>
            </>}
          </TouchableOpacity>
          <View style={s.divider}><View style={s.dividerLine} /><Text style={s.dividerTxt}>ou</Text><View style={s.dividerLine} /></View>
          <Text style={s.label}>E-mail</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail}
            placeholder="seu@email.com" placeholderTextColor={colors.text3}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <Text style={s.label}>Senha</Text>
          <TextInput style={s.input} value={senha} onChangeText={setSenha}
            placeholder="..." placeholderTextColor={colors.text3} secureTextEntry />
          <TouchableOpacity style={s.btnPrimary} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={colors.gold} /> : <Text style={s.btnPrimaryTxt}>Entrar</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('Signup')} activeOpacity={0.75}>
            <Text style={s.btnSecondaryTxt}>Nao tem conta? <Text style={s.link}>Criar conta</Text></Text>
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
  logo:      { width: 90, height: 90, borderRadius: 45, marginBottom: 16, borderWidth: 2, borderColor: colors.goldBorder },
  brand:     { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.goldLight, letterSpacing: 0.5 },
  tagline:   { fontSize: fontSize.sm, color: '#A0A8B8', marginTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: 28, borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.primary, marginBottom: 20 },
  btnGoogle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: 14, backgroundColor: '#FFFFFF',
  },
  googleG:     { fontSize: fontSize.base, fontWeight: fontWeight.black, color: '#4285F4' },
  btnGoogleTxt:{ fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text1 },
  divider:    { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  dividerLine:{ flex: 1, height: 1, backgroundColor: colors.border },
  dividerTxt: { fontSize: fontSize.sm, color: colors.text3 },
  label:     { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text2, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: 14, fontSize: fontSize.base, color: colors.text1, backgroundColor: '#FDFAF5',
  },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: 16, alignItems: 'center', marginTop: 24, borderWidth: 1.5, borderColor: colors.gold,
  },
  btnPrimaryTxt:   { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnSecondary:    { alignItems: 'center', marginTop: 18 },
  btnSecondaryTxt: { fontSize: fontSize.sm, color: colors.text3 },
  link:            { color: colors.gold, fontWeight: fontWeight.bold },
});
