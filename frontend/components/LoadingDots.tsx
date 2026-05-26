import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/theme/theme';

export interface LoadingDotsProps {
  color?: string;
  size?: number;
}

/**
 * Lightweight jumping loading dots indicator.
 * Animates 3 small dots sequentially using the native thread driver
 * to avoid bottlenecking low-end Android CPUs.
 */
export const LoadingDots: React.FC<LoadingDotsProps> = ({ color, size = 10 }) => {
  const { colors } = useTheme();
  const dotColor = color || colors.primary;

  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ])
      );
    };

    const a1 = createDotAnimation(anim1, 0);
    const a2 = createDotAnimation(anim2, 150);
    const a3 = createDotAnimation(anim3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [anim1, anim2, anim3]);

  const getStyle = (anim: Animated.Value) => {
    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -8],
    });
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: dotColor,
      transform: [{ translateY }],
    };
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Loading content"
    >
      <Animated.View style={[styles.dot, getStyle(anim1)]} />
      <Animated.View style={[styles.dot, getStyle(anim2)]} />
      <Animated.View style={[styles.dot, getStyle(anim3)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    gap: 6,
  },
  dot: {
    marginHorizontal: 2,
  },
});
