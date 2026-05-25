import React from 'react';
import { View, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useTheme } from '@/theme/theme';

export interface CardProps {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  active = false,
  onPress,
  style,
}) => {
  const { componentStyles } = useTheme();
  
  const baseStyle = active ? componentStyles.activeCard : componentStyles.standardCard;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          pressed && { opacity: 0.9 }, // micro-interaction feedback
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[baseStyle, style]}>
      {children}
    </View>
  );
};
