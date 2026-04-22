import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

type Props = { opacity?: number };

export default function GoldBackground({ opacity = 0.04 }: Props) {
  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <View style={s.pattern} />
    </View>
  );
}

const s = StyleSheet.create({
  pattern: {
    flex: 1,
    backgroundColor: '#C8A951',
    opacity: 0.15,
  },
});
