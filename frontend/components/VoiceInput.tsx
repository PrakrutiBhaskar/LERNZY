import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useTheme } from '@/theme/theme';
import { Mic, MicOff } from 'lucide-react-native';

export interface VoiceInputProps {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Child-friendly Mic Voice Input component.
 * Displays a large button (minimum touch target 64px) and triggers a pulsing
 * ripple animation on the native driver when recording is active.
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({
  isRecording,
  onPress,
  disabled = false,
}) => {
  const { colors, spacing } = useTheme();
  
  const pulseScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (isRecording) {
      pulseScale.setValue(0);
      pulseLoop = Animated.loop(
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        })
      );
      pulseLoop.start();
    } else {
      pulseScale.setValue(0);
    }

    return () => {
      if (pulseLoop) {
        pulseLoop.stop();
      }
    };
  }, [isRecording, pulseScale]);

  // Interpolate scaling and opacity for the ripple rings
  const rippleScale = pulseScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const rippleOpacity = pulseScale.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.4, 0],
  });

  return (
    <View style={styles.container}>
      {isRecording && (
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: colors.primarySubtle,
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />
      )}
      
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop voice recording' : 'Start voice recording'}
        accessibilityHint="Speak to ask your offline tutor questions"
        accessibilityState={{ checked: isRecording, disabled }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isRecording ? colors.error : colors.primary,
            opacity: disabled ? 0.5 : pressed ? 0.9 : 1.0,
          },
        ]}
      >
        {isRecording ? (
          <MicOff size={28} color={colors.textOnPrimary} />
        ) : (
          <Mic size={28} color={colors.textOnPrimary} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
  },
  ripple: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
