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

export default function OnboardingGrade(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedGrade() {
      const profile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
      if (profile && profile.grade) {
        setSelectedGrade(profile.grade);
      }
    }
    loadSavedGrade();
  }, []);

  const handleNext = async () => {
    if (!selectedGrade) return;

    try {
      const profile = (await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE)) || {};
      profile.grade = selectedGrade;
      await setObject(STORAGE_KEYS.STUDENT_PROFILE, profile);
      router.push('/(onboarding)/interests');
    } catch (e) {
      console.error(e);
    }
  };

  const gradeOptions = [
    { key: 'Class 6', en: 'Class 6', hi: 'कक्षा 6', kn: 'ತರಗತಿ 6' },
    { key: 'Class 7', en: 'Class 7', hi: 'कक्षा 7', kn: 'ತರಗತಿ 7' },
    { key: 'Class 8', en: 'Class 8', hi: 'कक्षा 8', kn: 'ತರಗತಿ 8' },
  ];

  return (
    <ScreenContainer
      title={language === 'en' ? 'Select Your Class' : language === 'hi' ? 'अपनी कक्षा चुनें' : 'ನಿಮ್ಮ ತರಗತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
      showBackButton={true}
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          {language === 'en'
            ? 'We will customize the subjects and syllabus to match your grade level.'
            : language === 'hi'
            ? 'हम आपकी कक्षा के स्तर के अनुसार विषयों और पाठ्यक्रम को अनुकूलित करेंगे।'
            : 'ನಿಮ್ಮ ತರಗತಿಯ ಮಟ್ಟಕ್ಕೆ ತಕ್ಕಂತೆ ನಾವು ವಿಷಯಗಳನ್ನು ಮತ್ತು ಪಠ್ಯಕ್ರಮವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತೇವೆ.'}
        </AppText>

        <View style={styles.grid}>
          {gradeOptions.map((grade) => {
            const label = language === 'en' ? grade.en : language === 'hi' ? grade.hi : grade.kn;
            return (
              <Card
                key={grade.key}
                active={selectedGrade === grade.key}
                onPress={() => setSelectedGrade(grade.key)}
                style={styles.gradeCard}
              >
                <AppText
                  variant="heading2"
                  style={styles.gradeLabel}
                  color={selectedGrade === grade.key ? colors.primary : colors.textPrimary}
                >
                  {label}
                </AppText>
              </Card>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಕ್ಕೆ'}
          disabled={!selectedGrade}
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
  gradeCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  gradeLabel: {
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
  },
});
