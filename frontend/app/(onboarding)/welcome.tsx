import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/theme';
import { useLanguage } from '@/i18n/LanguageContext';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';

export default function Welcome(): React.JSX.Element {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { t } = useLanguage();

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.container}>
      <View style={styles.heroContent}>
        {/* Decorative Badge */}
        <View style={[styles.illustrationCircle, { backgroundColor: colors.primarySubtle }]}>
          <AppText variant="display" color={colors.primary} style={styles.avatarChar}>
            🎓
          </AppText>
        </View>

        <AppText variant="display" color={colors.primary} style={styles.title}>
          {t('appName')}
        </AppText>
        <AppText variant="heading2" color={colors.textSecondary} style={styles.tagline}>
          {t('tagline')}
        </AppText>

        <Card style={styles.messageCard}>
          <AppText variant="heading2" style={styles.cardHeader}>
            {t('welcomeTitle')}
          </AppText>
          <AppText variant="bodyLg" color={colors.textSecondary} style={styles.cardBody}>
            {t('welcomeSubtitle')}
          </AppText>
        </Card>
      </View>

      <View style={styles.actionContainer}>
        <Button
          title={t('getStarted')}
          onPress={() => router.push('/(onboarding)/language')}
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: 20,
    flex: 1,
  },
  heroContent: {
    alignItems: 'center',
    marginTop: 40,
    flex: 1,
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarChar: {
    fontSize: 40,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    textAlign: 'center',
    marginBottom: 30,
  },
  messageCard: {
    width: '100%',
    padding: 20,
  },
  cardHeader: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardBody: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    width: '100%',
    marginTop: 20,
    paddingBottom: 24,
  },
  btn: {
    width: '100%',
  },
});
