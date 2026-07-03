/**
 * Unhinged design tokens — single source of truth.
 *
 * See DESIGN_SYSTEM.md for the rules that govern how these are used.
 * Import from here; never hard-code hex, radii, spacing, or durations
 * in components.
 */
export const colors = {
  // Backgrounds / shell
  ink: '#0E0B10',
  charcoal: '#17131B',
  deepPlum: '#241526',
  // Card surfaces
  cardCream: '#FFF3E6',
  cardSoft: '#F7E6D8',
  // Text
  textPrimary: '#171217',
  textInverse: '#FFF3E6',
  textMuted: '#AFA3B5',
  // Accents
  delulu: '#E83F8F', // primary brand accent
  unhingedPurple: '#8B3DFF', // secondary accent
  dangerCrush: '#FF304F', // sparingly: wildcard, warnings, destructive
  dopamine: '#FFB000', // reward moments, rare badges
  greenFlag: '#41D88A', // positive compatibility, success, safety
  // Borders / overlay
  borderDark: '#332638',
  borderLight: '#E8D2C1',
  overlay: 'rgba(14, 11, 16, 0.72)',
  // Translucent washes (derived from greenFlag / white) for success tints & reveal shimmer
  successWash: 'rgba(65, 216, 138, 0.12)',
  shimmer: 'rgba(255, 255, 255, 0.35)',
} as const;

export const gradients = {
  /** onboarding hero, selected CTA, Delulu Profile reveal */
  brand: [colors.delulu, colors.unhingedPurple] as const,
  /** wildcard card only */
  wildcard: [colors.dangerCrush, colors.delulu, colors.dopamine] as const,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/** Keyed by pixel value so `spacing[20]` reads as intent at the call site. */
export const spacing = {
  2: 2,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
} as const;

export const typography = {
  display: { fontSize: 36, lineHeight: 40, fontWeight: '800' },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
} as const;

/** Durations in ms. See DESIGN_SYSTEM.md §11 for easing guidance. */
export const motion = {
  instant: 80,
  fast: 140,
  standard: 220,
  slow: 360,
  reveal: 520,
} as const;

export const theme = {
  colors,
  gradients,
  radius,
  spacing,
  typography,
  motion,
} as const;

export type Theme = typeof theme;
export type ColorToken = keyof typeof colors;

export default theme;
