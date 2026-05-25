import { useContext } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { colors, subjectColors, SubjectType } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { getFontStyle, typeScale, TypographyVariant } from './typography';
import { LanguageContext } from '../i18n/LanguageContext';

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  typography: {
    scale: typeScale,
    getFontStyle,
  },
} as const;

export type ThemeType = typeof theme;

// Reusable base styles using ONLY tokens
export const componentStyles = {
  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48, // 48px minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  } as ViewStyle,

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 11, // 11px + 1.5px border * 2 = 14px total padding depth matches primary
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  } as ViewStyle,

  ghostButton: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  } as ViewStyle,

  disabledButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...shadows.none,
  } as ViewStyle,

  // Button Labels
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
    fontWeight: typeScale.button.fontWeight,
  } as TextStyle,

  secondaryButtonText: {
    color: colors.primary,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
    fontWeight: typeScale.button.fontWeight,
  } as TextStyle,

  ghostButtonText: {
    color: colors.primary,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
    fontWeight: typeScale.button.fontWeight,
  } as TextStyle,

  disabledButtonText: {
    color: colors.textDisabled,
    fontSize: typeScale.button.fontSize,
    lineHeight: typeScale.button.lineHeight,
    fontWeight: typeScale.button.fontWeight,
  } as TextStyle,

  // Cards
  standardCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.space4,
    ...shadows.card,
  } as ViewStyle,

  activeCard: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.space4,
    ...shadows.none,
  } as ViewStyle,

  // Input Fields
  inputField: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: typeScale.bodyLg.fontSize,
    lineHeight: typeScale.bodyLg.lineHeight,
    color: colors.textPrimary,
  } as ViewStyle,

  inputFocus: {
    borderColor: colors.primary,
  } as ViewStyle,

  inputError: {
    borderColor: colors.error,
  } as ViewStyle,

  // Tutor Bubble
  tutorBubble: {
    backgroundColor: colors.tutorBubble,
    borderRadius: radius.lg,
    borderTopLeftRadius: 4, // "speech bubble from top-left"
    padding: spacing.space4,
    maxWidth: '90%',
  } as ViewStyle,

  // Quiz Options
  quizOptionDefault: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.space4,
    ...shadows.card,
  } as ViewStyle,

  quizOptionSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.space4,
    ...shadows.none,
  } as ViewStyle,

  quizOptionCorrect: {
    backgroundColor: colors.successSubtle,
    borderColor: colors.success,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.space4,
  } as ViewStyle,

  quizOptionIncorrect: {
    backgroundColor: colors.warningSubtle,
    borderColor: colors.warning,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.space4,
  } as ViewStyle,
};

/**
 * Hook to retrieve the active theme tokens.
 * Automatically resolves fonts and line-heights dynamically based on the current language selection.
 */
export function useTheme() {
  const context = useContext(LanguageContext);
  const lang = context ? context.language : 'en';

  return {
    colors,
    spacing,
    radius,
    shadows,
    language: lang,
    componentStyles,
    // Automatically curry the language into getFontStyle
    getFontStyle: (variant: TypographyVariant) => getFontStyle(variant, lang),
  };
}

/**
 * Hook to resolve a subject-specific accent color dynamically.
 */
export function useSubjectColor(subject: string): string {
  // Normalize names: e.g. "Social Studies" -> "socialstudies" -> "social"
  const normalized = subject.toLowerCase().replace(/[^a-z]/g, '');

  if (normalized === 'math' || normalized === 'mathematics') {
    return subjectColors.math;
  }
  if (normalized === 'science') {
    return subjectColors.science;
  }
  if (normalized === 'social' || normalized === 'socialstudies' || normalized === 'socialscience') {
    return subjectColors.social;
  }
  if (normalized === 'english') {
    return subjectColors.english;
  }
  if (normalized === 'kannada') {
    return subjectColors.kannada;
  }

  return colors.primary; // Fallback brand color
}
