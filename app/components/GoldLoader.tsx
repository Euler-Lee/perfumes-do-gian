import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../lib/theme';

export default function GoldLoader() {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={s.container}>
      <Animated.Text style={[s.icon, { opacity: pulse }]}>🫙</Animated.Text>
      <Text style={s.txt}>Perfumes do Gian</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  icon: { fontSize: 52 },
  txt:  { fontSize: 18, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
});
