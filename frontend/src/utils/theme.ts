import { ViewStyle } from 'react-native';

export const COLORS = {
  // Primary Brand Colours
  primary: '#5B4FCF',
  primaryLight: '#8B80E8',
  primarySubtle: '#EEECfB',

  // Accent Colours (per subject)
  subjectMath: '#E8760A',
  subjectScience: '#2A9D5C',
  subjectSocial: '#D4500F',
  subjectEnglish: '#1A7AB5',
  subjectKannada: '#B5320A',

  // Semantic Colours
  success: '#2A9D5C',
  warning: '#F4A40A',
  error: '#D63B2F',
  info: '#1A7AB5',

  // Neutral / Surface Colours
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F1ED',
  border: '#DDD9CE',
  textPrimary: '#1C1B18',
  textSecondary: '#6B6860',
  textDisabled: '#AEABA0',
  textOnPrimary: '#FFFFFF',
} as const;

export const SPACING = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space12: 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 18,
  full: 9999,
} as const;

export const SHADOWS = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle,
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
  fab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
} as const;

export type TypographyVariant =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'button';

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '600' | '700';
}

export const TYPOGRAPHY_TOKENS: Record<TypographyVariant, TypographyStyle> = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  heading1: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  heading2: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
  },
  button: {
    fontSize: 15,
    lineHeight: 15,
    fontWeight: '600',
  },
};
