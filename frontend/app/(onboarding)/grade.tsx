import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, setObject } from '@/utils/storage';
import { ProgressBar } from '../../components/ProgressBar';

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
    { key: 'Class 6', val: '6', en: 'Class 6', hi: 'कक्षा 6', kn: 'ತರಗತಿ 6' },
    { key: 'Class 7', val: '7', en: 'Class 7', hi: 'कक्षा 7', kn: 'ತರಗತಿ 7' },
    { key: 'Class 8', val: '8', en: 'Class 8', hi: 'कक्षा 8', kn: 'ತರಗತಿ 8' },
  ];

  return (
    <ScreenContainer
      title={language === 'en' ? 'Select Your Class' : language === 'hi' ? 'अपनी कक्षा चुनें' : 'ನಿಮ್ಮ ತರಗತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={styles.container}
    >
      {/* Background Decorative Glow Blobs */}
      <View style={[styles.glowBlobLeft, { backgroundColor: colors.primarySubtle }]} />
      <View style={[styles.glowBlobRight, { backgroundColor: colors.primarySubtle }]} />

      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <ProgressBar progress={0.50} />
        </View>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          {language === 'en'
            ? 'We will customize the subjects and syllabus to match your grade level.'
            : language === 'hi'
            ? 'हम आपकी कक्षा के स्तर के अनुसार विषयों और पाठ्यक्रम को अनुकूलित करेंगे।'
            : 'ನಿಮ್ಮ ತರಗತಿಯ ಮಟ್ಟಕ್ಕೆ ತಕ್ಕಂತೆ ನಾವು ವಿಷಯಗಳನ್ನು ಮತ್ತು ಪಠ್ಯಕ್ರಮವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತೇವೆ.'}
        </AppText>

        <View style={styles.grid}>
          {gradeOptions.map((grade) => {
            const isSelected = selectedGrade === grade.key;
            const label = language === 'en' ? grade.en : language === 'hi' ? grade.hi : grade.kn;
            return (
              <Card
                key={grade.key}
                active={isSelected}
                onPress={() => setSelectedGrade(grade.key)}
                style={[
                  styles.gradeCard,
                  isSelected && { borderColor: colors.primary, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.cardRow}>
                  {/* Grade Badge Icon */}
                  <View style={[
                    styles.gradeBadge, 
                    { backgroundColor: isSelected ? colors.primary : colors.surfaceAlt }
                  ]}>
                    <AppText 
                      variant="heading1" 
                      color={isSelected ? colors.textOnPrimary : colors.primary}
                      style={styles.gradeNum}
                    >
                      {grade.val}
                    </AppText>
                  </View>

                  <AppText
                    variant="heading2"
                    style={styles.gradeLabel}
                    color={isSelected ? colors.primary : colors.textPrimary}
                  >
                    {label}
                  </AppText>

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
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>

        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಕ್ಕೆ'}
          disabled={!selectedGrade}
          onPress={handleNext}
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
  gradeCard: {
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
    gap: 16,
  },
  gradeBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeNum: {
    fontWeight: '800',
    fontSize: 22,
  },
  gradeLabel: {
    fontWeight: '700',
    flex: 1,
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
