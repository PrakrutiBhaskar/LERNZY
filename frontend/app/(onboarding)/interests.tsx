import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, setObject } from '@/utils/storage';
import { ProgressBar } from '../../components/ProgressBar';
import { InterestGrid, InterestItem } from '../../components/InterestGrid';

export default function OnboardingInterests(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    async function loadSavedInterests() {
      const profile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
      if (profile && profile.interests) {
        setSelectedInterests(profile.interests);
      }
    }
    loadSavedInterests();
  }, []);

  const handleInterestPress = (key: string) => {
    if (selectedInterests.includes(key)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== key));
    } else {
      setSelectedInterests([...selectedInterests, key]);
    }
  };

  const handleNext = async () => {
    if (selectedInterests.length === 0) return;

    try {
      const profile = (await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE)) || {};
      profile.interests = selectedInterests;
      await setObject(STORAGE_KEYS.STUDENT_PROFILE, profile);
      router.push('/(onboarding)/learning-style');
    } catch (e) {
      console.error(e);
    }
  };

  const interestOptions: InterestItem[] = [
    { id: 'space', label: language === 'en' ? 'Space & Planets' : language === 'hi' ? 'अंतरिक्ष और ग्रह' : 'ಬಾಹ್ಯಾಕಾಶ & ಗ್ರಹಗಳು', iconName: 'Rocket' },
    { id: 'nature', label: language === 'en' ? 'Animals & Nature' : language === 'hi' ? 'जानवर और प्रकृति' : 'ಪ್ರಾಣಿಗಳು & ಪ್ರಕೃತಿ', iconName: 'Leaf' },
    { id: 'robots', label: language === 'en' ? 'Computers & Robots' : language === 'hi' ? 'कंप्यूटर और रोबोट' : 'ಕಂಪ್ಯೂಟರ್ & ರೋಬೋಟ್‌ಗಳು', iconName: 'Bot' },
    { id: 'history', label: language === 'en' ? 'History & Mysteries' : language === 'hi' ? 'इतिहास और रहस्य' : 'ಇತಿಹಾಸ & ರಹಸ್ಯಗಳು', iconName: 'Compass' },
    { id: 'sports', label: language === 'en' ? 'Sports & Science' : language === 'hi' ? 'खेल और विज्ञान' : 'ಕ್ರೀಡೆ & ವಿಜ್ಞಾನ', iconName: 'Activity' },
    { id: 'stories', label: language === 'en' ? 'Stories & Poetry' : language === 'hi' ? 'कहानियां और कविताएं' : 'ಕಥೆಗಳು & ಕವನಗಳು', iconName: 'BookOpen' },
  ];

  return (
    <ScreenContainer
      title={language === 'en' ? 'What do you love?' : language === 'hi' ? 'आपको क्या पसंद है?' : 'ನಿಮಗೇನು ಇಷ್ಟ?'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={styles.container}
    >
      {/* Background Decorative Glow Blobs */}
      <View style={[styles.glowBlobLeft, { backgroundColor: colors.primarySubtle }]} />
      <View style={[styles.glowBlobRight, { backgroundColor: colors.primarySubtle }]} />

      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <ProgressBar progress={0.70} />
        </View>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          {language === 'en'
            ? 'Select at least one interest. We will use it to create personalized tutoring examples.'
            : language === 'hi'
            ? 'कम से कम एक रुचि चुनें। हम इसका उपयोग व्यक्तिगत उदाहरण बनाने के लिए करेंगे।'
            : 'ಕನಿಷ್ಠ ಒಂದು ಆಸಕ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಪಾಠಗಳಲ್ಲಿ ನಿಮ್ಮ ಇಷ್ಟದ ಉದಾಹರಣೆಗಳನ್ನು ನೀಡಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ.'}
        </AppText>

        <InterestGrid
          items={interestOptions}
          selectedIds={selectedInterests}
          onToggle={handleInterestPress}
        />
      </View>

      <View style={styles.footer}>
        {/* Onboarding step dot indicators */}
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>

        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಕ್ಕೆ'}
          disabled={selectedInterests.length === 0}
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
  footer: {
    marginTop: 30,
    paddingBottom: 24,
    width: '100%',
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
