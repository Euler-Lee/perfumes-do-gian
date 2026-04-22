import React, { useRef, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Pressable,
} from 'react-native';
import { colors } from '../lib/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible, title, message, confirmLabel = 'Excluir', confirmDanger = true, onConfirm, onCancel,
}: Props) {
  const scale   = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.88);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 14 }),
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  function dismiss(cb: () => void) {
    Animated.parallel([
      Animated.timing(scale,   { toValue: 0.88, duration: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0,    duration: 140, useNativeDriver: true }),
    ]).start(() => cb());
  }

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={() => dismiss(onCancel)}>
      <Pressable style={s.overlay} onPress={() => dismiss(onCancel)}>
        <Animated.View style={[s.card, { transform: [{ scale }], opacity }]}>
          <Pressable>
            <View style={s.iconRow}>
              <View style={[s.iconCircle, confirmDanger ? s.iconCircleDanger : s.iconCircleGold]}>
                <Text style={s.iconEmoji}>{confirmDanger ? '🗑️' : '✓'}</Text>
              </View>
            </View>
            <Text style={s.title}>{title}</Text>
            <Text style={s.message}>{message}</Text>
            <View style={s.buttons}>
              <TouchableOpacity style={s.btnCancel} onPress={() => dismiss(onCancel)} activeOpacity={0.75}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnConfirm, confirmDanger ? s.btnDanger : s.btnGold]}
                onPress={() => dismiss(onConfirm)} activeOpacity={0.8}>
                <Text style={s.btnConfirmText}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,20,0.60)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#FDFAF5',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#DDD5C8',
    width: '100%',
    maxWidth: 360,
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 24,
    shadowColor: '#1B2438',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 16,
  },
  iconRow:          { alignItems: 'center', marginBottom: 16 },
  iconCircle:       { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  iconCircleDanger: { backgroundColor: colors.dangerBg, borderColor: '#F5C0BA' },
  iconCircleGold:   { backgroundColor: colors.goldBg,   borderColor: colors.goldBorder },
  iconEmoji:        { fontSize: 30 },
  title: {
    fontSize: 18, fontWeight: '800', color: colors.text1,
    textAlign: 'center', marginBottom: 8,
  },
  message: {
    fontSize: 14, color: colors.text2,
    textAlign: 'center', lineHeight: 20, marginBottom: 28,
  },
  buttons:        { flexDirection: 'row', gap: 12 },
  btnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: '#F5F1EB', alignItems: 'center',
  },
  btnCancelText:  { fontSize: 15, fontWeight: '600', color: colors.text2 },
  btnConfirm:     { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnDanger:      { backgroundColor: colors.danger },
  btnGold:        { backgroundColor: colors.gold },
  btnConfirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
