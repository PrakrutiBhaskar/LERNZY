import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/theme';
import { useLanguage } from '@/i18n/LanguageContext';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';

const { width } = Dimensions.get('window');

export default function Welcome(): React.JSX.Element {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { t } = useLanguage();

  return (
    <ScreenContainer scrollable={true} contentContainerStyle={styles.container}>
      {/* Background Decorative Glow Blobs */}
      <View style={[styles.glowBlobLeft, { backgroundColor: colors.primarySubtle }]} />
      <View style={[styles.glowBlobRight, { backgroundColor: colors.primarySubtle }]} />

      <View style={styles.heroContent}>
        {/* Decorative Badge with a shadow and gradient border simulator */}
        <View style={[styles.avatarBorder, { borderColor: colors.primarySubtle }]}>
          <View style={[styles.illustrationCircle, { backgroundColor: colors.primary }]}>
            <AppText variant="display" color={colors.textOnPrimary} style={styles.avatarChar}>
              🎓
            </AppText>
          </View>
        </View>

        <AppText variant="display" color={colors.primary} style={styles.title}>
          {t('appName')}
        </AppText>
        <AppText variant="heading2" color={colors.textSecondary} style={styles.tagline}>
          {t('tagline')}
        </AppText>

        {/* Glassmorphic styled card */}
        <Card style={[styles.messageCard, { borderColor: `${colors.primary}20`, borderWidth: 1.5 }]}>
          <AppText variant="heading2" style={styles.cardHeader} color={colors.textPrimary}>
            {t('welcomeTitle')}
          </AppText>
          <AppText variant="bodyLg" color={colors.textSecondary} style={styles.cardBody}>
            {t('welcomeSubtitle')}
          </AppText>
        </Card>
      </View>

      <View style={styles.actionContainer}>
        {/* Onboarding step dot indicators */}
        <View style={styles.dotContainer}>
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>

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
    paddingVertical: 24,
    flexGrow: 1,
  },
  glowBlobLeft: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.5,
    zIndex: -1,
  },
  glowBlobRight: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.45,
    zIndex: -1,
  },
  heroContent: {
    alignItems: 'center',
    marginTop: 40,
    flex: 1,
    justifyContent: 'center',
  },
  avatarBorder: {
    borderWidth: 6,
    borderRadius: 60,
    marginBottom: 20,
    padding: 2,
  },
  illustrationCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarChar: {
    fontSize: 38,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    textAlign: 'center',
    marginBottom: 35,
    fontWeight: '600',
  },
  messageCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#1C1B18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardBody: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    width: '100%',
    marginTop: 30,
    paddingBottom: 24,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 20,
  },
  btn: {
    width: '100%',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
