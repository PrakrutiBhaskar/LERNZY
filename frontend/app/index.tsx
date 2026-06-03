import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/theme';
import { STORAGE_KEYS } from '@/utils/constants';
import { getBoolean } from '@/utils/storage';

/**
 * Initial boot entry point.
 * Centralized redirection is managed by RouteGuard in app/_layout.tsx.
 */
export default function Index(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    let active = true;

    async function redirectFromRoot() {
      const onboardingComplete = await getBoolean(STORAGE_KEYS.ONBOARDING_DONE, false);
      if (!active) return;

      router.replace(onboardingComplete ? '/(home)' : '/(onboarding)/welcome');
    }

    redirectFromRoot();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
