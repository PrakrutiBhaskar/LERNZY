import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

export interface TutorBubbleProps {
  message: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Friendly chat bubble representing the AI Tutor's speech.
 * Employs fixed light purple background and asymmetry in the top-left corner
 * to simulate a speech bubble. Automatically utilizes --text-body-lg for tutor responses.
 */
export const TutorBubble: React.FC<TutorBubbleProps> = React.memo(({ message, style }) => {
  const { componentStyles } = useTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Tutor says: ${message}`}
      style={[componentStyles.tutorBubble, style]}
    >
      <AppText variant="bodyLg">
        {message}
      </AppText>
    </View>
  );
});
