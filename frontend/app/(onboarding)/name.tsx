import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { TutorBubble } from '../../components/TutorBubble';
import { ScreenContainer } from '../../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, setObject } from '@/utils/storage';
import { ProgressBar } from '../../components/ProgressBar';

export default function OnboardingName(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSavedName() {
      const profile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
      if (profile && profile.name) {
        setName(profile.name);
      }
    }
    loadSavedName();
  }, []);

  const handleNext = async () => {
    if (!name.trim()) {
      setError(
        language === 'en'
          ? 'Please enter your name to continue'
          : language === 'hi'
          ? 'आगे बढ़ने के लिए कृपया अपना नाम दर्ज करें'
          : 'ಮುಂದುವರೆಯಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ'
      );
      return;
    }
    setError('');

    try {
      const profile = (await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE)) || {};
      profile.name = name.trim();
      await setObject(STORAGE_KEYS.STUDENT_PROFILE, profile);
      router.push('/(onboarding)/grade');
    } catch (e) {
      console.error(e);
    }
  };

  const getTutorMessage = () => {
    return language === 'en'
      ? "Hi there! I am Vidya, your personal AI tutor. Let's start by getting to know each other. What should I call you?"
      : language === 'hi'
      ? "नमस्ते! मैं विद्या हूँ, आपकी व्यक्तिगत एआई ट्यूटर। आइए एक-दूसरे को जानकर शुरुआत करें। मैं आपको क्या कहकर बुलाऊं?"
      : "ನಮಸ್ಕಾರ! ನಾನು ವಿದ್ಯಾ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಎಐ ಶಿಕ್ಷಕಿ. ಮೊದಲು ನಾವು ಪರಿಚಯ ಮಾಡಿಕೊಳ್ಳೋಣ. ನಾನು ನಿಮ್ಮನ್ನು ಏನೆಂದು ಕರೆಯಬೇಕು?";
  };

  return (
    <ScreenContainer
      title={language === 'en' ? 'Introduce Yourself' : language === 'hi' ? 'अपना परिचय दें' : 'ನಿಮ್ಮ ಪರಿಚಯ ಮಾಡಿಕೊಳ್ಳಿ'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={styles.container}
    >
      {/* Background Decorative Glow Blobs */}
      <View style={[styles.glowBlobLeft, { backgroundColor: colors.primarySubtle }]} />
      <View style={[styles.glowBlobRight, { backgroundColor: colors.primarySubtle }]} />

      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <ProgressBar progress={0.30} />
        </View>

        {/* AI Tutor Speech Bubble Introduction */}
        <View style={styles.tutorContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <AppText variant="heading2" color={colors.textOnPrimary} style={styles.avatarChar}>
              🤖
            </AppText>
          </View>
          <TutorBubble 
            message={getTutorMessage()} 
            style={[styles.tutorBubble, { borderColor: `${colors.primary}15`, borderWidth: 1 }]} 
          />
        </View>

        <InputField
          label={language === 'en' ? 'Your Name' : language === 'hi' ? 'आपका नाम' : 'ನಿಮ್ಮ ಹೆಸರು'}
          placeholder={language === 'en' ? 'Enter your name...' : language === 'hi' ? 'अपना नाम दर्ज करें...' : 'ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ...'}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (error) setError('');
          }}
          error={error}
          maxLength={30}
          containerStyle={styles.inputFieldContainer}
        />
      </View>

      <View style={styles.footer}>
        {/* Onboarding step dot indicators */}
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>

        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಕ್ಕೆ'}
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
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 20,
    width: '100%',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarChar: {
    fontSize: 22,
  },
  tutorBubble: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#1C1B18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  inputFieldContainer: {
    marginTop: 15,
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
