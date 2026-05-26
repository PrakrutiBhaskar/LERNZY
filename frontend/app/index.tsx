import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/utils/theme';

/**
 * Initial boot entry point.
 * Centralized redirection is managed by RouteGuard in app/_layout.tsx.
 */
export default function Index(): React.JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
