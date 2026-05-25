export const colors = {
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
  successSubtle: '#E8F7EE',
  warning: '#F4A40A',
  warningSubtle: '#FEF5E7',
  error: '#D63B2F', // Only for system errors, never for wrong quiz answers
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
  tutorBubble: '#F0EEFD', // fixed — slight purple tint, always
} as const;

export const subjectColors = {
  math: colors.subjectMath,
  mathematics: colors.subjectMath,
  science: colors.subjectScience,
  social: colors.subjectSocial,
  socialstudies: colors.subjectSocial,
  english: colors.subjectEnglish,
  kannada: colors.subjectKannada,
} as const;

export type ColorsType = typeof colors;
export type SubjectType = keyof typeof subjectColors;
