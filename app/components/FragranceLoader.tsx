/**
 * FragranceLoader — difusão de fragrância.
 * Três anéis concêntricos expandem a partir de um diamante dourado central,
 * simulando a dispersão de um perfume no ar.
 * Sem emojis, sem imagens externas — puro Animated API.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Easing } from 'react-native';
import { colors } from '../lib/theme';

const RING_SIZES = [44, 76, 108] as const;
const DELAYS     = [0, 750, 1500] as const;
const DURATION   = 2600;

function Ring({ size, delay }: { size: number; delay: number }) {
  const scale   = useRef(new Animated.Value(0.12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.60, duration: 250,           useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,    duration: DURATION - 250, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.12, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,    duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 1.5, borderColor: colors.gold,
        opacity, transform: [{ scale }],
      }}
    />
  );
}

export default function FragranceLoader({ label = 'Aguarde...' }: { label?: string }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 950, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.00, duration: 950, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={s.wrap}>
      <View style={s.scene}>
        {RING_SIZES.map((size, i) => (
          <Ring key={i} size={size} delay={DELAYS[i]} />
        ))}
        {/* Diamante central */}
        <Animated.View style={[s.outerDiamond, { transform: [{ rotate: '45deg' }, { scale: pulse }] }]}>
          <View style={s.innerDiamond} />
        </Animated.View>
      </View>
      {label ? <Text style={s.label}>{label}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  scene: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  outerDiamond: {
    width: 18, height: 18,
    borderWidth: 2, borderColor: colors.gold,
    borderRadius: 3,
    justifyContent: 'center', alignItems: 'center',
  },
  innerDiamond: {
    width: 8, height: 8,
    backgroundColor: colors.gold,
    borderRadius: 1,
  },
  label: {
    marginTop: 32,
    fontSize: 11,
    color: colors.text3,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});

