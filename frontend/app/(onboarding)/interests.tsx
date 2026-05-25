import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, setObject } from '@/utils/storage';

export default function OnboardingInterests(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

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

  const interestOptions = [
    { key: 'space', emoji: '🚀', en: 'Space & Planets', hi: 'अंतरिक्ष और ग्रह', kn: 'ಬಾಹ್ಯಾಕಾಶ & ಗ್ರಹಗಳು' },
    { key: 'nature', emoji: '🌿', en: 'Animals & Nature', hi: 'जानवर और प्रकृति', kn: 'ಪ್ರಾಣಿಗಳು & ಪ್ರಕೃತಿ' },
    { key: 'robots', emoji: '🤖', en: 'Computers & Robots', hi: 'कंप्यूटर और रोबोट', kn: 'ಕಂಪ್ಯೂಟರ್ & ರೋಬೋಟ್‌ಗಳು' },
    { key: 'history', emoji: '🏛️', en: 'History & Mysteries', hi: 'इतिहास और रहस्य', kn: 'ಇತಿಹಾಸ & ರಹಸ್ಯಗಳು' },
    { key: 'sports', emoji: '⚽', en: 'Sports & Science', hi: 'खेल और विज्ञान', kn: 'ಕ್ರೀಡೆ & ವಿಜ್ಞಾನ' },
    { key: 'stories', emoji: '📚', en: 'Stories & Poetry', hi: 'कहानियां और कविताएं', kn: 'ಕಥೆಗಳು & ಕವನಗಳು' },
  ];

  return (
    <ScreenContainer
      title={language === 'en' ? 'What do you love?' : language === 'hi' ? 'आपको क्या पसंद है?' : 'ನಿಮಗೇನು ಇಷ್ಟ?'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
          {language === 'en'
            ? 'Select at least one interest. We will use it to create personalized tutoring examples.'
            : language === 'hi'
            ? 'कम से कम एक रुचि चुनें। हम इसका उपयोग व्यक्तिगत उदाहरण बनाने के लिए करेंगे।'
            : 'ಕನಿಷ್ಠ ಒಂದು ಆಸಕ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಪಾಠಗಳಲ್ಲಿ ನಿಮ್ಮ ಇಷ್ಟದ ಉದಾಹರಣೆಗಳನ್ನು ನೀಡಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ.'}
        </AppText>

        <View style={styles.grid}>
          {interestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest.key);
            const label = language === 'en' ? interest.en : language === 'hi' ? interest.hi : interest.kn;

            return (
              <Card
                key={interest.key}
                active={isSelected}
                onPress={() => handleInterestPress(interest.key)}
                style={[
                  styles.interestCard,
                  { padding: spacing.space4 }
                ]}
              >
                <AppText variant="display" style={styles.emoji}>
                  {interest.emoji}
                </AppText>
                <AppText
                  variant="heading2"
                  style={styles.label}
                  color={isSelected ? colors.primary : colors.textPrimary}
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
          disabled={selectedInterests.length === 0}
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
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestCard: {
    width: '48%', // double column layout
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    flexGrow: 1,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },
  footer: {
    marginTop: 30,
    width: '100%',
  },
});
