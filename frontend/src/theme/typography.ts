import { TextStyle } from 'react-native';
import { LanguageCode } from '../utils/constants';

export const FONT_FAMILIES: Record<LanguageCode, string> = {
  en: 'NotoSans',
  hi: 'NotoSansDevanagari',
  kn: 'NotoSansKannada',
};

export type TypographyVariant =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'button';

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '600' | '700';
}

export const typeScale: Record<TypographyVariant, TypographyToken> = {
  display: {
    fontSize: 44,
    lineHeight: 54,
    fontWeight: '700',
  },
  heading1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  heading2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  bodyLg: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
};

/**
 * Get language-aware font styling based on STYLE_GUIDE.md guidelines.
 *
 * Rules implemented:
 * 1. Sets NotoSans, NotoSansDevanagari, or NotoSansKannada based on language.
 * 2. Give Kannada a 20% larger line height for vowel markers.
 * 3. Use 16sp (bodyLg) as the absolute minimum size for 'kn' and 'hi' scripts (raises body, bodySm, caption).
 */
export function getFontStyle(variant: TypographyVariant, lang: LanguageCode = 'en'): TextStyle {
  const token = typeScale[variant];
  let size = token.fontSize;
  let lineHeight = token.lineHeight;
  const fontWeight = token.fontWeight;

  // Rule 3: Use bodyLg (16sp) at minimum for Kannada/Devanagari scripts
  if ((lang === 'hi' || lang === 'kn') && size < 16) {
    size = 16;
    lineHeight = typeScale.bodyLg.lineHeight;
  }

  if (lang === 'kn' && (variant === 'display' || variant === 'heading1' || variant === 'heading2')) {
    size += 2;
  }

  // Kannada vowel markers need additional vertical room.
  if (lang === 'kn') {
    lineHeight = Math.ceil(lineHeight * 1.2);
  } else if (lang === 'hi') {
    lineHeight += 2;
  }

  return {
    fontFamily: FONT_FAMILIES[lang] || FONT_FAMILIES.en,
    fontSize: size,
    lineHeight: lineHeight,
    fontWeight: fontWeight,
  };
}
