import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Modal, FlatList,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import GoldBackground from '../../components/GoldBackground';
import SaveToast from '../../components/SaveToast';
import { colors, fontSize, fontWeight, radius, space } from '../../lib/theme';
import type { Categoria, PerfumeUso, AmbienteLabel } from '../../lib/types';
import { AMBIENTES } from '../../lib/types';

const CONCENTRACOES = ['Parfum (ExtDP)', 'EDP', 'EDT', 'EDC', 'Splash'];
const FAMILIAS = ['Amadeirado', 'Oriental', 'Floral', 'Fresco / Aquático', 'Cítrico', 'Especiado', 'Gourmand', 'Aromático'];

export default function PerfumeFormScreen({ route, navigation }: any) {
  const editId     = route.params?.id       as string | undefined;
  const catIdParam = route.params?.categoriaId as string | undefined;

  const [nome,       setNome]       = useState('');
  const [marca,      setMarca]      = useState('');
  const [tipo,       setTipo]       = useState<'arabe' | 'importado'>('arabe');
  const [concentracao, setConcentracao] = useState('');
  const [familia,    setFamilia]    = useState('');
  const [descricao,  setDescricao]  = useState('');
  const [volumeMl,   setVolumeMl]   = useState('');
  const [preco,      setPreco]      = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(catIdParam ?? null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalCat,   setModalCat]   = useState(false);
  const [usos,       setUsos]       = useState<Record<PerfumeUso['ambiente'], string>>({
    trabalho: '', casual: '', noite: '', eventos: '', verao: '', inverno: '',
  });

  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [showToast,setShowToast] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar Perfume' : 'Novo Perfume' });
    supabase.from('categorias').select('*').order('nome').then(({ data }) => {
      setCategorias((data as Categoria[]) ?? []);
    });
    if (!editId) return;
    supabase.from('perfumes').select('*, usos_perfume(*)').eq('id', editId).single().then(({ data }) => {
      if (data) {
        setNome(data.nome);
        setMarca(data.marca ?? '');
        setTipo(data.tipo);
        setConcentracao(data.concentracao ?? '');
        setFamilia(data.familia_olfativa ?? '');
        setDescricao(data.descricao ?? '');
        setVolumeMl(data.volume_ml ? String(data.volume_ml) : '');
        setPreco(data.preco ? String(data.preco) : '');
        setCategoriaId(data.categoria_id ?? null);
        const usosData: Record<string, string> = { trabalho: '', casual: '', noite: '', eventos: '', verao: '', inverno: '' };
        (data.usos_perfume ?? []).forEach((u: any) => { usosData[u.ambiente] = String(u.percentual); });
        setUsos(usosData as any);
      }
      setFetching(false);
    });
  }, [editId]);

  const totalUsos = Object.values(usos).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const catNome = categorias.find(c => c.id === categoriaId)?.nome;

  async function handleSave() {
    if (!nome.trim()) { Alert.alert('Informe o nome do perfume.'); return; }
    if (totalUsos > 100) { Alert.alert('Os percentuais de uso somam mais de 100%.'); return; }

    setLoading(true);
    const payload = {
      nome: nome.trim(),
      marca: marca.trim() || null,
      tipo,
      concentracao: concentracao || null,
      familia_olfativa: familia || null,
      descricao: descricao.trim() || null,
      volume_ml: volumeMl ? parseInt(volumeMl) : null,
      preco: preco ? parseFloat(preco.replace(',', '.')) : null,
      categoria_id: categoriaId,
    };

    let perfumeId = editId;
    if (editId) {
      const { error } = await supabase.from('perfumes').update(payload).eq('id', editId);
      if (error) { setLoading(false); Alert.alert('Erro', error.message); return; }
      await supabase.from('usos_perfume').delete().eq('perfume_id', editId);
    } else {
      const { data, error } = await supabase.from('perfumes').insert(payload).select().single();
      if (error || !data) { setLoading(false); Alert.alert('Erro', error?.message ?? 'Erro ao salvar.'); return; }
      perfumeId = data.id;
    }

    // Salvar usos
    const usosInsert = AMBIENTES
      .filter(a => usos[a.key] && parseFloat(usos[a.key]) > 0)
      .map(a => ({ perfume_id: perfumeId, ambiente: a.key, percentual: parseFloat(usos[a.key]) }));
    if (usosInsert.length > 0) {
      await supabase.from('usos_perfume').insert(usosInsert);
    }

    setLoading(false);
    setShowToast(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (fetching) return <View style={s.center}><ActivityIndicator color={colors.gold} /></View>;

  return (
    <>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GoldBackground opacity={0.03} />
        <SaveToast visible={showToast} />
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          {/* Tipo */}
          <Text style={s.label}>Tipo *</Text>
          <View style={s.tipoRow}>
            {(['arabe', 'importado'] as const).map(t => (
              <TouchableOpacity
                key={t} style={[s.tipoBtn, tipo === t && s.tipoBtnSel]}
                onPress={() => setTipo(t)}>
                <Text style={[s.tipoTxt, tipo === t && s.tipoTxtSel]}>
                  {t === 'arabe' ? '🪔 Árabe / Inspirado' : '✈️ Importado'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nome */}
          <Text style={s.label}>Nome *</Text>
          <TextInput style={s.input} value={nome} onChangeText={setNome}
            placeholder="Ex: Oud Al Layl, Sauvage..." placeholderTextColor={colors.text3} />

          {/* Marca */}
          <Text style={s.label}>Marca / Fabricante</Text>
          <TextInput style={s.input} value={marca} onChangeText={setMarca}
            placeholder="Ex: Swiss Arabian, Dior..." placeholderTextColor={colors.text3} />

          {/* Concentração */}
          <Text style={s.label}>Concentração</Text>
          <View style={s.chipRow}>
            {CONCENTRACOES.map(c => (
              <TouchableOpacity key={c} style={[s.chip, concentracao === c && s.chipSel]} onPress={() => setConcentracao(c === concentracao ? '' : c)}>
                <Text style={[s.chipTxt, concentracao === c && s.chipTxtSel]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Família olfativa */}
          <Text style={s.label}>Família Olfativa</Text>
          <View style={s.chipRow}>
            {FAMILIAS.map(f => (
              <TouchableOpacity key={f} style={[s.chip, familia === f && s.chipSel]} onPress={() => setFamilia(f === familia ? '' : f)}>
                <Text style={[s.chipTxt, familia === f && s.chipTxtSel]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categoria */}
          <Text style={s.label}>Categoria</Text>
          <TouchableOpacity style={s.selectorBtn} onPress={() => setModalCat(true)}>
            <Text style={catNome ? s.selectorSel : s.selectorPlaceholder}>
              {catNome ? `🗂️ ${catNome}` : 'Selecionar categoria...'}
            </Text>
            {categoriaId && (
              <TouchableOpacity onPress={() => setCategoriaId(null)}>
                <Text style={s.limpar}>✕</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Descrição */}
          <Text style={s.label}>Notas / Descrição</Text>
          <TextInput style={[s.input, s.inputMulti]} value={descricao} onChangeText={setDescricao}
            placeholder="Notas de topo, coração e fundo..." placeholderTextColor={colors.text3}
            multiline numberOfLines={4} textAlignVertical="top" />

          {/* Volume e Preço */}
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Volume (ml)</Text>
              <TextInput style={s.input} value={volumeMl} onChangeText={setVolumeMl}
                placeholder="Ex: 50" placeholderTextColor={colors.text3} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Preço (R$)</Text>
              <TextInput style={s.input} value={preco} onChangeText={setPreco}
                placeholder="Ex: 350,00" placeholderTextColor={colors.text3} keyboardType="decimal-pad" />
            </View>
          </View>

          {/* Usos por ambiente */}
          <View style={s.secDivider} />
          <Text style={s.secTitle}>Uso por Ambiente (%)</Text>
          <Text style={s.secSub}>
            Informe o percentual ideal de uso para cada ambiente. Somam {totalUsos.toFixed(0)}%.
          </Text>

          {AMBIENTES.map(amb => (
            <View key={amb.key} style={s.usoRow}>
              <Text style={s.usoLabel}>{amb.icon} {amb.label}</Text>
              <TextInput
                style={s.usoInput}
                value={usos[amb.key]}
                onChangeText={v => setUsos(prev => ({ ...prev, [amb.key]: v }))}
                placeholder="0"
                placeholderTextColor={colors.text3}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={s.usoSuffix}>%</Text>
            </View>
          ))}

          <TouchableOpacity style={s.btn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.goldLight} /> : <Text style={s.btnTxt}>Salvar Perfume</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Categoria */}
      <Modal visible={modalCat} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Selecionar categoria</Text>
            <FlatList
              data={categorias}
              keyExtractor={c => c.id}
              style={{ maxHeight: 350 }}
              ListEmptyComponent={<Text style={s.empty}>Nenhuma categoria cadastrada.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.modalOpt} onPress={() => { setCategoriaId(item.id); setModalCat(false); }}>
                  <Text style={s.modalOptTxt}>{item.icone ?? '🫙'} {item.nome}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalCat(false)}>
              <Text style={s.cancelTxt}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: space[5], paddingBottom: 48 },
  label:     { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text2, marginBottom: 8, marginTop: 18 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: 14, fontSize: fontSize.base, color: colors.text1, backgroundColor: colors.surface,
  },
  inputMulti: { minHeight: 100 },
  row:        { flexDirection: 'row', gap: 12 },
  tipoRow:    { flexDirection: 'row', gap: 10 },
  tipoBtn:    { flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  tipoBtnSel: { backgroundColor: colors.primary, borderColor: colors.gold },
  tipoTxt:    { fontSize: fontSize.sm, color: colors.text2, fontWeight: fontWeight.semibold },
  tipoTxtSel: { color: colors.goldLight },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:       { paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  chipSel:    { backgroundColor: colors.goldBg, borderColor: colors.gold },
  chipTxt:    { fontSize: fontSize.sm, color: colors.text2 },
  chipTxtSel: { color: colors.primary, fontWeight: fontWeight.bold },
  selectorBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: 14, backgroundColor: colors.surface, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  selectorSel:         { fontSize: fontSize.base, color: colors.text1, fontWeight: fontWeight.semibold },
  selectorPlaceholder: { fontSize: fontSize.base, color: colors.text3 },
  limpar: { fontSize: 16, color: colors.danger, fontWeight: fontWeight.bold, paddingLeft: 8 },
  secDivider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },
  secTitle:   { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.primary },
  secSub:     { fontSize: fontSize.sm, color: colors.text3, marginTop: 4, marginBottom: 8 },
  usoRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  usoLabel:   { flex: 1, fontSize: fontSize.sm, color: colors.text1, fontWeight: fontWeight.semibold },
  usoInput: {
    width: 64, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: 10, fontSize: fontSize.base, color: colors.text1, backgroundColor: colors.surface,
    textAlign: 'center',
  },
  usoSuffix:   { fontSize: fontSize.base, color: colors.text3, width: 16 },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md, padding: 16,
    alignItems: 'center', marginTop: 32, borderWidth: 1.5, borderColor: colors.gold,
  },
  btnTxt:       { color: colors.goldLight, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  empty:        { color: colors.text3, textAlign: 'center', padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle:   { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.primary, marginBottom: 16 },
  modalOpt:     { padding: 14, borderBottomWidth: 1, borderColor: colors.border },
  modalOptTxt:  { fontSize: fontSize.base, color: colors.text1 },
  cancelBtn:    { marginTop: 16, backgroundColor: colors.goldBg, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  cancelTxt:    { color: colors.primary, fontWeight: fontWeight.bold },
});
