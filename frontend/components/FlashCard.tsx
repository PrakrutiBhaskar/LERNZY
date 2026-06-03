import React, { useState, useRef } from 'react';
import { StyleSheet, Pressable, Animated, View } from 'react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

export interface FlashCardProps {
  frontText: string;
  backText: string;
  hintText?: string;
}

/**
 * Child-friendly study Flashcard with 3D Flip capability.
 * Rotates cards in under 300ms using the React Native Animated thread,
 * ensuring high frames on low-resource GPU processors.
 */
export const FlashCard: React.FC<FlashCardProps> = React.memo(({
  frontText,
  backText,
  hintText,
}) => {
  const { colors, spacing, shadows } = useTheme();
  
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 280, // strict requirement: under 300ms
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  // Interpolate rotation transitions
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Handle mid-rotation opacity swap to resolve Android backface visibility issues
  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const frontStyle = {
    transform: [{ rotateY: frontRotateY }],
    opacity: frontOpacity,
  };

  const backStyle = {
    transform: [{ rotateY: backRotateY }],
    opacity: backOpacity,
  };

  return (
    <Pressable
      onPress={handleFlip}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={isFlipped ? `Card back side showing: ${backText}` : `Card front side showing: ${frontText}`}
      accessibilityHint="Tap to flip the card and reveal details"
      style={styles.cardContainer}
    >
      {/* Front Face Card */}
      <Animated.View
        style={[
          styles.cardFace,
          frontStyle,
          { backgroundColor: colors.surface, padding: spacing.space5, ...shadows.card },
        ]}
      >
        <AppText variant="caption" color={colors.textSecondary} style={styles.hint}>
          {hintText || (isFlipped ? 'DEFINITION' : 'TAP TO REVEAL')}
        </AppText>
        <AppText variant="heading1" style={styles.textFront} color={colors.textPrimary}>
          {frontText}
        </AppText>
      </Animated.View>

      {/* Back Face Card */}
      <Animated.View
        pointerEvents={isFlipped ? 'auto' : 'none'}
        style={[
          styles.cardFace,
          styles.cardBack,
          backStyle,
          {
            backgroundColor: colors.primarySubtle,
            padding: spacing.space5,
            ...shadows.none,
          },
        ]}
      >
        <AppText variant="caption" color={colors.primary} style={styles.hint}>
          {isFlipped ? 'DEFINITION' : 'TAP TO REVEAL'}
        </AppText>
        <AppText variant="bodyLg" style={styles.textBack} color={colors.textPrimary}>
          {backText}
        </AppText>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
    minHeight: 220,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backfaceVisibility: 'hidden',
  },
  hint: {
    position: 'absolute',
    top: 14,
    fontWeight: '700',
    letterSpacing: 0,
  },
  textFront: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 28,
  },
  textBack: {
    textAlign: 'center',
    lineHeight: 26,
  },
});
