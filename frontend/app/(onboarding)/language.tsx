import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LanguageCode } from '@/utils/constants';
import { ProgressBar } from '../../components/ProgressBar';

export default function LanguageSelection(): React.JSX.Element {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { colors, spacing } = useTheme();

  const handleLanguageChange = async (lang: LanguageCode) => {
    await setLanguage(lang);
  };

  const languages: { code: LanguageCode; label: string; subLabel: string; char: string }[] = [
    { code: 'en', label: 'English', subLabel: 'Learn in English', char: 'A' },
    { code: 'hi', label: 'हिन्दी', subLabel: 'हिंदी में सीखें', char: 'अ' },
    { code: 'kn', label: 'ಕನ್ನಡ', subLabel: 'ಕನ್ನಡದಲ್ಲಿ ಕಲಿಯಿರಿ', char: 'ಅ' },
  ];

  return (
    <ScreenContainer
      title={t('selectLanguage')}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={styles.container}
    >
      {/* Background Decorative Glow Blobs */}
      <View style={[styles.glowBlobLeft, { backgroundColor: colors.primarySubtle }]} />
      <View style={[styles.glowBlobRight, { backgroundColor: colors.primarySubtle }]} />

      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <ProgressBar progress={0.15} />
        </View>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          Select the language you want to study and speak with your AI tutor in:
        </AppText>

        <View style={styles.grid}>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <Card
                key={lang.code}
                active={isSelected}
                onPress={() => handleLanguageChange(lang.code)}
                style={[
                  styles.langCard,
                  isSelected && { borderColor: colors.primary, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.cardRow}>
                  {/* Language Avatar Badge */}
                  <View style={[
                    styles.langAvatar, 
                    { backgroundColor: isSelected ? colors.primary : colors.surfaceAlt }
                  ]}>
                    <AppText 
                      variant="heading2" 
                      color={isSelected ? colors.textOnPrimary : colors.primary}
                      style={styles.langChar}
                    >
                      {lang.char}
                    </AppText>
                  </View>
                  
                  {/* Text Container */}
                  <View style={styles.textContainer}>
                    <AppText 
                      variant="heading2" 
                      style={styles.langLabel} 
                      color={isSelected ? colors.primary : colors.textPrimary}
                    >
                      {lang.label}
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary}>
                      {lang.subLabel}
                    </AppText>
                  </View>

                  {/* Radio Indicator */}
                  <View style={[
                    styles.radioOuter, 
                    { borderColor: isSelected ? colors.primary : colors.border }
                  ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        {/* Onboarding step dot indicators */}
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>

        <Button
          title={t('continue')}
          onPress={() => router.push('/(onboarding)/name')}
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
  content: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 24,
    fontWeight: '500',
  },
  grid: {
    gap: 16,
  },
  langCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1C1B18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  langAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChar: {
    fontWeight: '700',
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  langLabel: {
    fontWeight: '700',
    marginBottom: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
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
