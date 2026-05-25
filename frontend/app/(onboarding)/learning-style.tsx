import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, setObject } from '@/utils/storage';
import { ProgressBar } from '../components/ProgressBar';

export default function OnboardingLearningStyle(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedStyle() {
      const profile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
      if (profile && profile.learningStyle) {
        setSelectedStyle(profile.learningStyle);
      }
    }
    loadSavedStyle();
  }, []);

  const handleNext = async () => {
    if (!selectedStyle) return;

    try {
      const profile = (await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE)) || {};
      profile.learningStyle = selectedStyle;
      await setObject(STORAGE_KEYS.STUDENT_PROFILE, profile);
      router.push('/(onboarding)/done');
    } catch (e) {
      console.error(e);
    }
  };

  const styleOptions = [
    { key: 'reading', emoji: '📝', en: 'Reading & Notes', hi: 'पढ़ना और नोट्स', kn: 'ಓದುವಿಕೆ & ಟಿಪ್ಪಣಿಗಳು' },
    { key: 'audio', emoji: '🎧', en: 'Listen & Learn', hi: 'सुनकर सीखना', kn: 'ಕೇಳಿ ಕಲಿಯಿರಿ' },
    { key: 'quiz', emoji: '🧩', en: 'Quizzes & Games', hi: 'खेल और पहेली', kn: 'ರಸಪ್ರಶ್ನೆ & ಆಟಗಳು' },
  ];

  return (
    <ScreenContainer
      title={language === 'en' ? 'Choose Learning Style' : language === 'hi' ? 'सीखने की शैली चुनें' : 'ಕಲಿಕಾ ಶೈಲಿಯನ್ನು ಆರಿಸಿ'}
      showBackButton={true}
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <ProgressBar progress={0.85} />
        </View>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          {language === 'en'
            ? 'How do you learn best? We will highlight these content formats in your topics.'
            : language === 'hi'
            ? 'आप सबसे अच्छी तरह कैसे सीखते हैं? हम आपके विषयों में इन प्रारूपों को हाइलाइट करेंगे।'
            : 'ನೀವು ಹೇಗೆ ಉತ್ತಮವಾಗಿ ಕಲಿಯುತ್ತೀರಿ? ನಾವು ಈ ಕಲಿಕಾ ಮಾದರಿಗಳಿಗೆ ಹೆಚ್ಚಿನ ಆದ್ಯತೆ ನೀಡುತ್ತೇವೆ.'}
        </AppText>

        <View style={styles.grid}>
          {styleOptions.map((option) => {
            const label = language === 'en' ? option.en : language === 'hi' ? option.hi : option.kn;
            return (
              <Card
                key={option.key}
                active={selectedStyle === option.key}
                onPress={() => setSelectedStyle(option.key)}
                style={styles.styleCard}
              >
                <AppText variant="heading1" style={styles.emoji}>
                  {option.emoji}
                </AppText>
                <View style={styles.labelContainer}>
                  <AppText
                    variant="heading2"
                    style={styles.label}
                    color={selectedStyle === option.key ? colors.primary : colors.textPrimary}
                  >
                    {label}
                  </AppText>
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಕ್ಕೆ'}
          disabled={!selectedStyle}
          onPress={handleNext}
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
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  emoji: {
    fontSize: 28,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
  },
});
