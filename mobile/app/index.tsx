import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { getBoolean } from '../src/utils/storage';
import { STORAGE_KEYS } from '../src/utils/constants';

/**
 * LERNZY Initial Boot Router
 *
 * Future Architectural Evolution (Issue 5):
 * Currently this handles a binary redirect: onboarding completed? -> /(home) : /(onboarding)/welcome.
 * As the system grows, the routing flow will expand to:
 *   1. Boot & DB check: Schema matches and first-launch migrations are success?
 *   2. Onboarding check: completed? -> Next step : Go to Onboarding wizard
 *   3. AI Local Inference model check: Model downloaded & cached? -> /(home) : Go to Model Setup wizard
 *
 * Target route flow:
 *   Boot -> Onboarding (if new) -> Model Setup (if missing model) -> Main Home Dashboard
 */
export default function Index(): React.JSX.Element {
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      const done = await getBoolean(STORAGE_KEYS.ONBOARDING_DONE, false);
      setIsOnboardingDone(done);
    }
    checkOnboarding();
  }, []);

  if (isOnboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' }}>
        <ActivityIndicator size="large" color="#5B4FCF" />
      </View>
    );
  }

  if (isOnboardingDone) {
    return <Redirect href="/(home)" />;
  } else {
    return <Redirect href="/(onboarding)/welcome" />;
  }
}
