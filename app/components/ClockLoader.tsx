import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../lib/theme';

const SIZE = 72;
const R    = SIZE / 2;

// Hand: container cobre toda a face do relógio (SIZE×SIZE)
// A haste fica na metade superior, pivô no centro
function StaticHand({ angleDeg, length, width, color }: {
  angleDeg: number; length: number; width: number; color: string;
}) {
  return (
    <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${angleDeg}deg` }] }]}>
      <View style={{
        position: 'absolute',
        width,
        height: length,
        bottom: R,
        left: R - width / 2,
        backgroundColor: color,
        borderRadius: width,
      }} />
    </View>
  );
}

function AnimatedHand({ animValue, length, width, color }: {
  animValue: Animated.Value; length: number; width: number; color: string;
}) {
  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
      <View style={{
        position: 'absolute',
        width,
        height: length,
        bottom: R,
        left: R - width / 2,
        backgroundColor: color,
        borderRadius: width,
      }} />
    </Animated.View>
  );
}

export default function ClockLoader({ label = 'Aguarde...' }: { label?: string }) {
  const secondAnim = useRef(new Animated.Value(0)).current;

  const now     = new Date();
  const hours   = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourDeg   = (hours / 12) * 360 + (minutes / 60) * 30;
  const minuteDeg = (minutes / 60) * 360;
  const secStart  = seconds / 60;

  useEffect(() => {
    secondAnim.setValue(secStart);
    Animated.loop(
      Animated.timing(secondAnim, {
        toValue: secStart + 1,
        duration: (60 - seconds) * 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // Tick marks: 12 pontos ao redor do mostrador
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const rTick = R - 6;
    return {
      x: R + rTick * Math.cos(angle),
      y: R + rTick * Math.sin(angle),
      major: i % 3 === 0,
    };
  });

  return (
    <View style={s.wrap}>
      <View style={s.face}>
        {/* Ticks */}
        {ticks.map((t, i) => (
          <View key={i} style={{
            position: 'absolute',
            width:  t.major ? 4 : 2,
            height: t.major ? 4 : 2,
            borderRadius: 2,
            backgroundColor: t.major ? colors.gold : colors.goldLight,
            left: t.x - (t.major ? 2 : 1),
            top:  t.y - (t.major ? 2 : 1),
          }} />
        ))}

        {/* Hora */}
        <StaticHand angleDeg={hourDeg} length={18} width={3} color={colors.gold} />
        {/* Minuto */}
        <StaticHand angleDeg={minuteDeg} length={26} width={2} color={colors.gold} />
        {/* Segundo (animado) */}
        <AnimatedHand animValue={secondAnim} length={30} width={1} color={colors.goldLight} />

        {/* Centro */}
        <View style={s.center} />
      </View>
      {label ? <Text style={s.label}>{label}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  face: {
    width: SIZE, height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
  },
  center: {
    position: 'absolute',
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    top:  R - 3,
    left: R - 3,
  },
  label: {
    marginTop: 16,
    fontSize: 12,
    color: colors.text3,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});
