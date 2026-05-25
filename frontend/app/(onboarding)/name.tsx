import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { ScreenContainer } from '../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, setObject } from '@/utils/storage';
import { ProgressBar } from '../components/ProgressBar';

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

  return (
    <ScreenContainer
      title={language === 'en' ? 'Introduce Yourself' : language === 'hi' ? 'अपना परिचय दें' : 'ನಿಮ್ಮ ಪರಿಚಯ ಮಾಡಿಕೊಳ್ಳಿ'}
      showBackButton={true}
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <ProgressBar progress={0.30} />
        </View>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          {language === 'en'
            ? 'What should your AI tutor call you during lessons?'
            : language === 'hi'
            ? 'पाठों के दौरान आपका एआई ट्यूटर आपको क्या कहकर बुलाए?'
            : 'ಪಾಠಗಳ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಎಐ ಶಿಕ್ಷಕರು ನಿಮ್ಮನ್ನು ಏನೆಂದು ಕರೆಯಬೇಕು?'}
        </AppText>

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
        />
      </View>

      <View style={styles.footer}>
        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಕ್ಕೆ'}
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
  footer: {
    marginTop: 20,
  },
});
