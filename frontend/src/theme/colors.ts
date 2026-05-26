export const colors = {
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
  successSubtle: '#10372D',
  warning: '#FBBF24',
  warningSubtle: '#3A2D0D',
  error: '#F87171', // Only for system errors, never for wrong quiz answers
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
  tutorBubble: '#1E1B36',
} as const;

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

export type ColorsType = typeof colors;
export type SubjectType = keyof typeof subjectColors;
