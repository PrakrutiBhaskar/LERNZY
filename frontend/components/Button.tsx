import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  ActivityIndicator,
  StyleProp,
  PressableProps,
} from 'react-native';

import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

export interface ButtonProps extends PressableProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  textColor,
  style,
  ...rest
}) => {
  const { colors, componentStyles } = useTheme();

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
      android_ripple={{
        color: 'rgba(255,255,255,0.1)',
      }}
      style={({ pressed }) => [
        styles.base,
        getButtonStyle(),
        pressed &&
          !disabled &&
          !loading && {
            opacity: 0.85,
            transform: [{ scale: 0.98 }],
          },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? colors.textOnPrimary
              : colors.textPrimary
          }
        />
      ) : (
        <View style={styles.content}>
          {icon && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}

          <AppText
            variant="button"
            style={[
              styles.text,
              getTextStyle(),
              textColor ? { color: textColor } : null,
            ]}
          >
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    minHeight: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: '100%',
  },

  iconContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
