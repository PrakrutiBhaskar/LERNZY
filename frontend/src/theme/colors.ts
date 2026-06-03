export const lightColors = {
  // Digital Thinnai: warm earth, sun, and growth.
  primary: '#8F4E00',
  primaryLight: '#FF9933',
  primarySubtle: '#FFE2C2',
  primaryContainer: '#FF9933',
  onPrimaryContainer: '#3A1D00',

  // Accent colours remain distinct without becoming neon.
  subjectMath: '#B85F00',
  subjectScience: '#287A32',
  subjectSocial: '#A14C3A',
  subjectEnglish: '#2E668C',
  subjectKannada: '#9B4F19',
  subjectCoding: '#476C65',

  // Semantic colours
  success: '#056E00',
  successSubtle: '#D9F2D3',
  warning: '#735C00',
  warningSubtle: '#FFE087',
  error: '#A33A2B', // Only for system errors, never for wrong quiz answers
  errorSubtle: '#F9DDD7',
  info: '#2E668C',

  // Tonal layering replaces hard borders.
  bg: '#FBF9F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1ECE5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F5F3EF',
  surfaceContainerHigh: '#EEE9E1',
  surfaceContainerHighest: '#E4E2DE',
  surfaceBright: '#FFF8EE',
  surfaceVariant: '#E4E2DE',
  outlineVariant: '#DBC2B0',
  border: '#F1ECE5',
  textPrimary: '#1B1C1A',
  textSecondary: '#5F5D58',
  textDisabled: '#96918A',
  textOnPrimary: '#3A1D00',
  tutorBubble: '#FFF1DF',
  tertiary: '#735C00',
  tertiaryFixed: '#FFE087',
} as const;

export type ColorsType = { [K in keyof typeof lightColors]: string };

export const darkColors: ColorsType = {
  // Digital Thinnai after sunset: warm charcoal, ember, and leaf.
  primary: '#FFB56A',
  primaryLight: '#FFD2A3',
  primarySubtle: '#513014',
  primaryContainer: '#FF9933',
  onPrimaryContainer: '#3A1D00',

  subjectMath: '#FFB45D',
  subjectScience: '#78C978',
  subjectSocial: '#E7907D',
  subjectEnglish: '#83B7D7',
  subjectKannada: '#E99A63',
  subjectCoding: '#8DB9B0',

  success: '#75C86E',
  successSubtle: '#173D1B',
  warning: '#EBCB6B',
  warningSubtle: '#4A3D16',
  error: '#FFB4A8',
  errorSubtle: '#542923',
  info: '#83B7D7',

  bg: '#171713',
  surface: '#24231F',
  surfaceAlt: '#302E28',
  surfaceContainerLowest: '#24231F',
  surfaceContainerLow: '#1E1E1A',
  surfaceContainerHigh: '#302E28',
  surfaceContainerHighest: '#3A3831',
  surfaceBright: '#302B22',
  surfaceVariant: '#3A3831',
  outlineVariant: '#655A4E',
  border: '#302E28',
  textPrimary: '#F6F0E7',
  textSecondary: '#C9C1B7',
  textDisabled: '#918A81',
  textOnPrimary: '#3A1D00',
  tutorBubble: '#382B1E',
  tertiary: '#EBCB6B',
  tertiaryFixed: '#4A3D16',
};

// Keep a light default for startup paths that render before ThemeProvider is ready.
export const colors = lightColors;

export const subjectColors = {
  math: colors.subjectMath,
  mathematics: colors.subjectMath,
  science: colors.subjectScience,
  social: colors.subjectSocial,
  socialstudies: colors.subjectSocial,
  english: colors.subjectEnglish,
  kannada: colors.subjectKannada,
  coding: colors.subjectCoding,
  code: colors.subjectCoding,
  programming: colors.subjectCoding,
} as const;

export type SubjectType = keyof typeof subjectColors;
