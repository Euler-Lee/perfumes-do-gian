import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';

type Props = { visible: boolean; message?: string };

export default function SaveToast({ visible, message = 'Salvo com sucesso!' }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity,     { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY,  { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={[s.toast, { opacity, transform: [{ translateY }] }]}>
      <Text style={s.icon}>✓</Text>
      <Text style={s.txt}>{message}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  toast: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1B2438', borderRadius: 24,
    paddingVertical: 12, paddingHorizontal: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22, shadowRadius: 12, elevation: 10,
    zIndex: 999,
  },
  icon: { fontSize: 18, color: '#C8A951' },
  txt:  { fontSize: 15, fontWeight: '700', color: '#fff' },
});
