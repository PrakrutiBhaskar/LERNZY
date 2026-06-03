import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { useLanguage } from '@/i18n/LanguageContext';
import { getOnboardingCopy } from '@/onboarding/copy';
import { type ColorsType } from '@/theme/colors';
import { useTheme } from '@/theme/theme';

export default function Welcome(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
  const { colors } = useTheme();
  const styles = createStyles(colors);

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

const createStyles = (colors: ColorsType) => StyleSheet.create({
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
    backgroundColor: colors.primarySubtle,
  },
  logoText: {
    color: colors.primary,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '900',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLowest,
    padding: 22,
    marginTop: 28,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
