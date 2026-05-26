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
    { key: 'reading', emoji: '📝', en: 'Reading & Notes', hi: 'पढ़ना और नोट्स', kn: 'ಓದುವಿಕೆ & ಟಿಪ್ಪಣಿಗಳು', desc: { en: 'Story-based concept explanations and diagrams', hi: 'कहानी-आधारित अवधारणा स्पष्टीकरण और चित्र', kn: 'ಕಥೆ ಆಧಾರಿತ ಪರಿಕಲ್ಪನೆ ವಿವರಣೆ ಮತ್ತು ರೇಖಾಚಿತ್ರಗಳು' } },
    { key: 'audio', emoji: '🎧', en: 'Listen & Learn', hi: 'सुनकर सीखना', kn: 'ಕೇಳಿ ಕಲಿಯಿರಿ', desc: { en: 'Text-to-speech audio reading for all lessons', hi: 'सभी पाठों के लिए ऑडियो रीडिंग', kn: 'ಎಲ್ಲಾ ಪಾಠಗಳಿಗೆ ಆಡಿಯೋ ಓದುವಿಕೆ' } },
    { key: 'quiz', emoji: '🧩', en: 'Quizzes & Games', hi: 'खेल और पहेली', kn: 'ರಸಪ್ರಶ್ನೆ & ಆಟಗಳು', desc: { en: 'Interactive practice challenges and flashcards', hi: 'इंटरैक्टिव अभ्यास चुनौतियाँ और फ्लैशकार्ड', kn: 'ಸಂವಾದಾತ್ಮಕ ಅಭ್ಯಾಸ ಸವಾಲುಗಳು ಮತ್ತು ಫ್ಲ್ಯಾಶ್‌ಕಾರ್ಡ್‌ಗಳು' } },
  ];

  return (
    <ScreenContainer
      title={language === 'en' ? 'Choose Learning Style' : language === 'hi' ? 'सीखने की शैली चुनें' : 'ಕಲಿಕಾ ಶೈಲಿಯನ್ನು ಆರಿಸಿ'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={styles.container}
    >
      {/* Background Decorative Glow Blobs */}
      <View style={[styles.glowBlobLeft, { backgroundColor: colors.primarySubtle }]} />
      <View style={[styles.glowBlobRight, { backgroundColor: colors.primarySubtle }]} />

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
            const isSelected = selectedStyle === option.key;
            const label = language === 'en' ? option.en : language === 'hi' ? option.hi : option.kn;
            const descText = option.desc[language] || option.desc.en;
            return (
              <Card
                key={option.key}
                active={isSelected}
                onPress={() => setSelectedStyle(option.key)}
                style={[
                  styles.styleCard,
                  isSelected && { borderColor: colors.primary, borderWidth: 1.5 },
                ]}
              >
                <View style={[
                  styles.emojiCircle, 
                  { backgroundColor: isSelected ? colors.primary : colors.surfaceAlt }
                ]}>
                  <AppText variant="heading1" style={[styles.emoji, isSelected && { color: colors.textOnPrimary }]}>
                    {option.emoji}
                  </AppText>
                </View>
                
                <View style={styles.labelContainer}>
                  <AppText
                    variant="heading2"
                    style={styles.label}
                    color={isSelected ? colors.primary : colors.textPrimary}
                  >
                    {label}
                  </AppText>
                  <AppText variant="body" color={colors.textSecondary} style={styles.desc}>
                    {descText}
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
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]} />
        </View>

        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಕ್ಕೆ'}
          disabled={!selectedStyle}
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
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1C1B18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '700',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
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
