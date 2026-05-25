import React from 'react';
import { Pressable, StyleSheet, ViewStyle, ActivityIndicator, StyleProp } from 'react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const { colors, componentStyles } = useTheme();

  // Resolve button style dynamically
  const getButtonStyle = () => {
    if (disabled || loading) {
      return componentStyles.disabledButton;
    }
    switch (variant) {
      case 'secondary':
        return componentStyles.secondaryButton;
      case 'ghost':
        return componentStyles.ghostButton;
      case 'primary':
      default:
        return componentStyles.primaryButton;
    }
  };

  // Resolve text style dynamically
  const getTextStyle = () => {
    if (disabled || loading) {
      return componentStyles.disabledButtonText;
    }
    switch (variant) {
      case 'secondary':
        return componentStyles.secondaryButtonText;
      case 'ghost':
        return componentStyles.ghostButtonText;
      case 'primary':
      default:
        return componentStyles.primaryButtonText;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getButtonStyle(),
        // Simple 100ms fade press effect for low-end GPU performance
        pressed && !disabled && !loading && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textOnPrimary : colors.primary}
        />
      ) : (
        <>
          {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
          {/* React Native SVG or Lucide icons can be passed as icon component */}
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <AppText
            variant="button"
            style={[
              getTextStyle(),
              icon ? { marginLeft: 8 } : null,
            ]}
          >
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
};
