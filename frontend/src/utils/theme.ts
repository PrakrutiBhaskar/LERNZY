import { ViewStyle } from 'react-native';

export const COLORS = {
  // Primary Brand Colours
  primary: '#A78BFA',
  primaryLight: '#C4B5FD',
  primarySubtle: '#241F3A',

  // Accent Colours (per subject)
  subjectMath: '#F59E0B',
  subjectScience: '#34D399',
  subjectSocial: '#FB7185',
  subjectEnglish: '#38BDF8',
  subjectKannada: '#F97316',
  subjectCoding: '#22D3EE',

  // Semantic Colours
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#38BDF8',

  // Neutral / Surface Colours
  bg: '#070A12',
  surface: '#111827',
  surfaceAlt: '#1F2937',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textDisabled: '#64748B',
  textOnPrimary: '#070A12',
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
