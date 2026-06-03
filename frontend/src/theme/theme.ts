import { useContext, useMemo } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { colors, type ColorsType } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { getFontStyle, typeScale, TypographyVariant } from './typography';
import { LanguageContext } from '../i18n/LanguageContext';
import { useThemeMode } from './ThemeContext';

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
function createComponentStyles(colors: ColorsType) {
  return {
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
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  } as ViewStyle,

  ghostButton: {
    backgroundColor: colors.surfaceAlt,
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
    color: colors.textPrimary,
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
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    padding: spacing.space5,
    ...shadows.card,
  } as ViewStyle,

  activeCard: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
    padding: spacing.space5,
    ...shadows.none,
  } as ViewStyle,

  // Input Fields
  inputField: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: typeScale.bodyLg.fontSize,
    lineHeight: typeScale.bodyLg.lineHeight,
    color: colors.textPrimary,
  } as ViewStyle,

  inputFocus: {
    backgroundColor: colors.primarySubtle,
  } as ViewStyle,

  inputError: {
    backgroundColor: colors.errorSubtle,
  } as ViewStyle,

  // Tutor Bubble
  tutorBubble: {
    backgroundColor: colors.tutorBubble,
    borderRadius: radius.lg,
    borderTopLeftRadius: 4, // "speech bubble from top-left"
    padding: spacing.space5,
    maxWidth: '90%',
  } as ViewStyle,

  // Quiz Options
  quizOptionDefault: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    padding: spacing.space4,
    ...shadows.card,
  } as ViewStyle,

  quizOptionSelected: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
    padding: spacing.space4,
    ...shadows.none,
  } as ViewStyle,

  quizOptionCorrect: {
    backgroundColor: colors.successSubtle,
    borderRadius: radius.md,
    padding: spacing.space4,
  } as ViewStyle,

  quizOptionIncorrect: {
    backgroundColor: colors.warningSubtle,
    borderRadius: radius.md,
    padding: spacing.space4,
  } as ViewStyle,
  };
}

export const componentStyles = createComponentStyles(colors);

/**
 * Hook to retrieve the active theme tokens.
 * Automatically resolves fonts and line-heights dynamically based on the current language selection.
 */
export function useTheme() {
  const context = useContext(LanguageContext);
  const lang = context ? context.language : 'en';
  const { colors: activeColors, mode, setMode, toggleMode } = useThemeMode();
  const activeComponentStyles = useMemo(
    () => createComponentStyles(activeColors),
    [activeColors]
  );

  return {
    colors: activeColors,
    spacing,
    radius,
    shadows,
    language: lang,
    mode,
    setMode,
    toggleMode,
    componentStyles: activeComponentStyles,
    // Automatically curry the language into getFontStyle
    getFontStyle: (variant: TypographyVariant) => getFontStyle(variant, lang),
  };
}

/**
 * Hook to resolve a subject-specific accent color dynamically.
 */
export function useSubjectColor(subject: string): string {
  const { colors } = useTheme();

  // Normalize names: e.g. "Social Studies" -> "socialstudies" -> "social"
  const normalized = subject.toLowerCase().replace(/[^a-z]/g, '');

  if (normalized === 'math' || normalized === 'mathematics') {
    return colors.subjectMath;
  }
  if (normalized === 'science') {
    return colors.subjectScience;
  }
  if (normalized === 'social' || normalized === 'socialstudies' || normalized === 'socialscience') {
    return colors.subjectSocial;
  }
  if (normalized === 'english') {
    return colors.subjectEnglish;
  }
  if (normalized === 'kannada') {
    return colors.subjectKannada;
  }
  if (normalized === 'coding' || normalized === 'code' || normalized === 'programming') {
    return colors.subjectCoding;
  }

  return colors.primary; // Fallback brand color
}
