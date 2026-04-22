// Tema Perfumes do Gian — luxo masculino, cores sóbrias e elegantes

export const colors = {
  // Primárias
  primary:     '#1B2438', // midnight navy
  primaryDark: '#111827',
  gold:        '#C8A951', // ouro mate
  goldLight:   '#E8D080',
  goldBg:      '#FBF6E8',
  goldBorder:  '#DFC880',

  // Backgrounds
  bg:      '#F5F1EB', // pergaminho quente
  surface: '#FFFFFF',
  card:    '#FDFBF7',

  // Textos
  text1: '#1B2438',
  text2: '#4A4560',
  text3: '#8A8490',

  // Bordas
  border:     '#DDD5C8',
  borderDark: '#B8B0A4',

  // Feedback
  danger:    '#C0392B',
  dangerBg:  '#FDECEA',
  success:   '#27AE60',
  successBg: '#E8F8EF',

  // Tipos
  arabe:          '#7B4F2E',
  arabeBg:        '#FBF0E6',
  arabeBorder:    '#D4956A',
  importado:      '#1B2438',
  importadoBg:    '#EEF1F8',
  importadoBorder:'#8898BC',
};

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
};

export const fontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
  heavy:   '800' as const,
  black:   '900' as const,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  full: 999,
};

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
};

export const shadow = {
  xs: {
    shadowColor: '#1B2438',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: '#1B2438',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#1B2438',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const headerStyle = {
  default: {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: fontWeight.bold, fontSize: fontSize.md },
    headerShadowVisible: false,
  },
  gold: {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: colors.goldLight,
    headerTitleStyle: { fontWeight: fontWeight.bold, fontSize: fontSize.md },
    headerShadowVisible: false,
  },
};
