import React, { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const { colors, componentStyles } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText variant="bodySm" color={colors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={colors.textDisabled}
        style={[
          componentStyles.inputField,
          isFocused && componentStyles.inputFocus,
          !!error && componentStyles.inputError,
          style,
        ] as any}
        {...props}
      />
      {error && (
        <AppText variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
  },
});
