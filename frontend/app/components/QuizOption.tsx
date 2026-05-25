import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

export interface QuizOptionProps {
  text: string;
  selected?: boolean;
  status?: 'none' | 'correct' | 'incorrect';
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Quiz option component for student interaction.
 * Switches colors depending on selected state and evaluation status (correct/incorrect) post-submit.
 * Uses --text-body-lg as the reading font.
 */
export const QuizOption: React.FC<QuizOptionProps> = ({
  text,
  selected = false,
  status = 'none',
  disabled = false,
  onPress,
  style,
}) => {
  const { colors, componentStyles } = useTheme();

  const getOptionStyle = () => {
    if (status === 'correct') {
      return componentStyles.quizOptionCorrect;
    }
    if (status === 'incorrect') {
      return componentStyles.quizOptionIncorrect;
    }
    if (selected) {
      return componentStyles.quizOptionSelected;
    }
    return componentStyles.quizOptionDefault;
  };

  const getTextColor = () => {
    if (status === 'correct') {
      return colors.success;
    }
    if (status === 'incorrect') {
      return colors.warning; // Gentle warning/caution color, never error red
    }
    return colors.textPrimary;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="radio"
      accessibilityLabel={`Option: ${text}`}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityHint={status === 'none' ? 'Tap to select this option' : `Evaluated as ${status}`}
      style={({ pressed }) => [
        getOptionStyle(),
        pressed && !disabled && { opacity: 0.95 },
        style,
      ]}
    >
      <AppText variant="bodyLg" color={getTextColor()}>
        {text}
      </AppText>
    </Pressable>
  );
};
