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
  const { colors } = useTheme();

  const handleLanguageChange = async (lang: LanguageCode) => {
    await setLanguage(lang);
  };

  return (
    <ScreenContainer
      title={t('selectLanguage')}
      showBackButton={true}
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <ProgressBar progress={0.15} />
        </View>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          Select the language you want to study and speak with your AI tutor in:
        </AppText>

        <View style={styles.grid}>
          <Card
            active={language === 'en'}
            onPress={() => handleLanguageChange('en')}
            style={styles.langCard}
          >
            <AppText variant="heading1" style={styles.langLabel} color={language === 'en' ? colors.primary : colors.textPrimary}>
              English
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Learn in English
            </AppText>
          </Card>

          <Card
            active={language === 'hi'}
            onPress={() => handleLanguageChange('hi')}
            style={styles.langCard}
          >
            <AppText variant="heading1" style={styles.langLabel} color={language === 'hi' ? colors.primary : colors.textPrimary}>
              हिन्दी
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              हिंदी में सीखें
            </AppText>
          </Card>

          <Card
            active={language === 'kn'}
            onPress={() => handleLanguageChange('kn')}
            style={styles.langCard}
          >
            <AppText variant="heading1" style={styles.langLabel} color={language === 'kn' ? colors.primary : colors.textPrimary}>
              ಕನ್ನಡ
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              ಕನ್ನಡದಲ್ಲಿ ಕಲಿಯಿರಿ
            </AppText>
          </Card>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('continue')}
          onPress={() => router.push('/(onboarding)/name')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 24,
  },
  grid: {
    gap: 16,
  },
  langCard: {
    alignItems: 'flex-start',
    padding: 18,
  },
  langLabel: {
    fontWeight: '700',
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
  },
});
