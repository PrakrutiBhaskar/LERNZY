import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { useLanguage } from '@/i18n/LanguageContext';
import { getOnboardingCopy } from '@/onboarding/copy';

export default function Welcome(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);

  return (
    <OnboardingFrame
      title="Lernzy"
      subtitle={copy.welcomeSubtitle}
      actionLabel={copy.getStarted}
      onAction={() => router.push('/(onboarding)/language')}
      showBack={false}
      step={1}
    >
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>L</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{copy.welcomeTitle}</Text>
          <Text style={styles.cardText}>
            {copy.welcomeBody}
          </Text>
        </View>
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#241F3A',
  },
  logoText: {
    color: '#C4B5FD',
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '900',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    backgroundColor: '#111827',
    padding: 22,
    marginTop: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardText: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
