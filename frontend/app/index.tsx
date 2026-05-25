import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getBoolean } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { COLORS } from '@/utils/theme';

/**
 * Initial boot router that directs the user to either the onboarding flow
 * or the home dashboard depending on whether onboarding has been completed.
 */
export default function Index(): React.JSX.Element {
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const done = await getBoolean(STORAGE_KEYS.ONBOARDING_DONE, false);
        setIsOnboardingDone(done);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingDone(false);
      }
    }
    checkOnboarding();
  }, []);

  if (isOnboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isOnboardingDone) {
    return <Redirect href="/(home)" />;
  } else {
    return <Redirect href="/(onboarding)/welcome" />;
  }
}
