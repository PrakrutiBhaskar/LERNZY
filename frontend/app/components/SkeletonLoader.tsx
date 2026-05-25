import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/theme';

export interface SkeletonLoaderProps {
  variant?: 'rect' | 'circle' | 'text' | 'card';
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable loading skeleton placeholder component.
 * Uses a lightweight opacity animation loop, avoiding heavy rendering cycles
 * for peak performance on low-end devices.
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rect',
  width = '100%',
  height = 20,
  style,
}) => {
  const { colors, radius } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Smooth looping micro-animation (opacity transition between 0.4 and 0.85)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Determine shape styles
  const getShapeStyle = () => {
    switch (variant) {
      case 'circle':
        return {
          borderRadius: typeof width === 'number' ? width / 2 : 50,
        };
      case 'text':
        return {
          borderRadius: radius.sm,
          height: 12,
        };
      case 'card':
        return {
          borderRadius: radius.md,
          height: 120,
          padding: 16,
        };
      case 'rect':
      default:
        return {
          borderRadius: radius.sm,
        };
    }
  };

  if (variant === 'card') {
    return (
      <Animated.View
        style={[
          styles.base,
          {
            backgroundColor: colors.surfaceAlt,
            opacity: pulseAnim,
            width: width as any,
            height,
          },
          getShapeStyle(),
          style,
        ]}
      >
        <View style={[styles.innerRow, { gap: 12 }]}>
          <View style={[styles.innerCircle, { backgroundColor: colors.bg, width: 40, height: 40, borderRadius: 20 }]} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.innerTextLine, { backgroundColor: colors.bg, height: 16, width: '60%', borderRadius: 4 }]} />
            <View style={[styles.innerTextLine, { backgroundColor: colors.bg, height: 12, width: '90%', borderRadius: 3 }]} />
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.base,
        {
          backgroundColor: colors.surfaceAlt,
          opacity: pulseAnim,
          width: width as any,
          height,
        },
        getShapeStyle(),
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  innerCircle: {
    opacity: 0.5,
  },
  innerTextLine: {
    opacity: 0.5,
  },
});
