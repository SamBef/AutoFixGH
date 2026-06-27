export const colors = {
  // Primary brand — deep navy, feels premium on outdoor screens
  brand: '#0B0E1A',
  brandLight: '#151929',

  // Accent — Ghana gold
  accent: '#E8A020',
  accentDim: '#C4871A',

  // Success — forest green
  success: '#1A7A4A',

  // Danger / SOS
  danger: '#D63B2F',
  dangerLight: '#FF4D3D',

  // Neutrals
  surface: '#FFFFFF',
  surfaceAlt: '#F5F6FA',
  border: '#E2E4EC',
  borderLight: '#F0F1F7',

  // Text
  text: '#0B0E1A',
  textSecondary: '#5A5F7A',
  textMuted: '#9399B2',
  textInverse: '#FFFFFF',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const duration = {
  micro: 120,
  component: 300,
  screen: 400,
  character: 750,
} as const

export const typography = {
  hero: 40,
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  micro: 12,
} as const
