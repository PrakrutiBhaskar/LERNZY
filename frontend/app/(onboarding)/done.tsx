import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { useLanguage } from '@/i18n/LanguageContext';
import { finishOnboarding, loadOnboardingProfile } from '@/onboarding/profile';
import { getOnboardingCopy } from '@/onboarding/copy';

export default function DoneScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
  const [progress, setProgress] = useState(0);
  const ready = progress >= 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(timer);
          return 100;
        }
        return current + 20;
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  const handleFinish = async () => {
    const profile = await loadOnboardingProfile();
    await finishOnboarding({ ...profile, language: profile.language || language });
    router.replace('/(home)');
  };

  return (
    <OnboardingFrame
      title={ready ? copy.doneTitleReady : copy.doneTitleLoading}
      subtitle={ready ? copy.doneSubtitleReady : copy.doneSubtitleLoading}
      actionLabel={ready ? copy.startLearning : copy.preparing}
      onAction={handleFinish}
      actionDisabled={!ready}
      showBack={false}
    >
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Text style={styles.successText}>{ready ? copy.doneOk : `${progress}%`}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.bodyText}>
          {ready
            ? copy.doneBodyReady
            : copy.doneBodyLoading}
        </Text>
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#241F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: '#C4B5FD',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
    marginTop: 28,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#34D399',
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 28,
  },
});
