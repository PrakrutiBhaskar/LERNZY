import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '@/theme/theme';
import { TypographyVariant } from '@/theme/typography';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

/**
 * A highly accessible, language-aware Text component.
 * Automatically resolves the correct Noto Sans variant (Regular, Devanagari, or Kannada)
 * and adjusts size/line-height based on selected language layout rules.
 */
export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color,
  style,
  children,
  ...props
}) => {
  const { getFontStyle, colors } = useTheme();
  const fontStyle = getFontStyle(variant);

  return (
    <RNText
      style={[
        { color: color || colors.textPrimary },
        fontStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};
