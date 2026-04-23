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

 * Três partículas ascendem em curvas suaves com fade-in/out e leve balanço lateral,
 * simulando a difusão de uma fragrância no ar.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Easing } from 'react-native';
import { colors } from '../lib/theme';

type Particle = {
  y:      Animated.Value;
  x:      Animated.Value;
  op:     Animated.Value;
  scale:  Animated.Value;
};

function useParticle(delay: number): Particle {
  const y     = useRef(new Animated.Value(0)).current;
  const x     = useRef(new Animated.Value(0)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Subida suave
          Animated.timing(y, {
            toValue: -90,
            duration: 2400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          // Balanço lateral ondulante (vai e volta)
          Animated.sequence([
            Animated.timing(x, {
              toValue: 8,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(x, {
              toValue: -8,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(x, {
              toValue: 4,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          // Opacidade: aparece e some suavemente
          Animated.sequence([
            Animated.timing(op, {
              toValue: 0.85,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(op, {
              toValue: 0.0,
              duration: 1800,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          // Cresce levemente (névoa se expande)
          Animated.timing(scale, {
            toValue: 1.4,
            duration: 2400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Reset instantâneo
        Animated.parallel([
          Animated.timing(y,     { toValue: 0,   duration: 0, useNativeDriver: true }),
          Animated.timing(x,     { toValue: 0,   duration: 0, useNativeDriver: true }),
          Animated.timing(op,    { toValue: 0,   duration: 0, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return { y, x, op, scale };
}

export default function FragranceLoader({ label = 'Aguarde...' }: { label?: string }) {
  const p1 = useParticle(0);
  const p2 = useParticle(700);
  const p3 = useParticle(1400);

  const particles = [
    { ...p1, offsetX: -14, color: colors.goldLight,  size: 18 },
    { ...p2, offsetX:   0, color: colors.gold,        size: 22 },
    { ...p3, offsetX:  14, color: colors.goldBorder,  size: 16 },
  ];

  // Pulso suave do frasco
  const bottlePulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bottlePulse, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bottlePulse, { toValue: 1.00, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={s.wrap}>
      <View style={s.scene}>
        {/* Partículas de névoa */}
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              s.particle,
              {
                width: p.size, height: p.size, borderRadius: p.size / 2,
                backgroundColor: p.color,
                left: '50%',
                marginLeft: p.offsetX - p.size / 2,
                opacity: p.op,
                transform: [
                  { translateY: p.y },
                  { translateX: p.x },
                  { scale: p.scale },
                ],
              },
            ]}
          />
        ))}

        {/* Frasco de perfume (emoji + pulsação) */}
        <Animated.View style={[s.bottle, { transform: [{ scale: bottlePulse }] }]}>
          <Text style={s.bottleEmoji}>🧴</Text>
        </Animated.View>
      </View>

      {label ? <Text style={s.label}>{label}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  scene: { width: 80, height: 120, justifyContent: 'flex-end', alignItems: 'center' },
  particle: {
    position: 'absolute',
    bottom: 56,
  },
  bottle:      { position: 'absolute', bottom: 0 },
  bottleEmoji: { fontSize: 52 },
  label: {
    marginTop: 20,
    fontSize: 12,
    color: colors.text3,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});
