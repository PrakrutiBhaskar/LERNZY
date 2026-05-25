import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/theme/theme';

export interface ProgressBarProps {
  progress: number; // value between 0 and 1
  color?: string;
  height?: number;
}

/**
 * Child-friendly animated progress bar.
 * Uses Animated timing to smoothly ease width transitions during lesson completion.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 8,
}) => {
  const { colors } = useTheme();
  const barColor = color || colors.primary;
  
  const animatedWidth = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 350,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, [progress, animatedWidth]);

  const widthStyle = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.container, { height, backgroundColor: colors.surfaceAlt }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(progress * 100),
      }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: barColor,
            width: widthStyle,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
