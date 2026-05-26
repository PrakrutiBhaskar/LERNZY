import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { setBoolean } from '@/utils/storage';

export default function OnboardingDone(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isDownloading) {
      interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDownloading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 300); // 3 seconds download simulation
    }
    return () => clearInterval(interval);
  }, [isDownloading]);

  const handleFinish = async () => {
    try {
      // Mark onboarding complete and models ready
      await setBoolean(STORAGE_KEYS.MODELS_READY, true);
      await setBoolean(STORAGE_KEYS.ONBOARDING_DONE, true);

      // Go to home flow
      router.replace('/(home)');
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusText = () => {
    if (isDownloading) {
      return language === 'en'
        ? `Downloading offline AI models (${downloadProgress}%)...`
        : language === 'hi'
          ? `ऑफ़लाइन एआई मॉडल डाउनलोड हो रहे हैं (${downloadProgress}%)...`
          : `ಆಫ್‌ಲೈನ್ ಎಐ ಮಾದರಿಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ (${downloadProgress}%)...`;
    }
    return language === 'en'
      ? 'Setup complete! You can learn offline now.'
      : language === 'hi'
        ? 'सेटअप पूरा हुआ! अब आप ऑफ़लाइन सीख सकते हैं।'
        : 'ಸ್ಥಾಪನೆ ಪೂರ್ಣಗೊಂಡಿದೆ! ನೀವೀಗ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಕಲಿಯಬಹುದು.';
  };

  return (
    <ScreenContainer
      title={language === 'en' ? 'Model Setup' : language === 'hi' ? 'मॉडल सेटअप' : 'ಮಾದರಿ ಸ್ಥಾಪನೆ'}
      showBackButton={false}
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
          <AppText variant="display" color={colors.primary}>
            {isDownloading ? '⚙️' : '🎉'}
          </AppText>
        </View>

        <AppText variant="heading2" style={styles.title} color={colors.textPrimary}>
          {isDownloading
            ? (language === 'en' ? 'Getting lernzy Ready' : language === 'hi' ? 'विद्या को तैयार कर रहे हैं' : 'ವಿದ್ಯಾ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ')
            : (language === 'en' ? 'Everything is Ready!' : language === 'hi' ? 'सब कुछ तैयार है!' : 'ಎಲ್ಲವೂ ಸಿದ್ಧವಾಗಿದೆ!')}
        </AppText>

        <AppText variant="body" color={colors.textSecondary} style={styles.description}>
          {language === 'en'
            ? 'We are setting up local language synthesis and reasoning engines on your phone. No internet connection will be required after this step.'
            : language === 'hi'
              ? 'हम आपके फोन पर स्थानीय भाषा संश्लेषण और तर्क इंजन स्थापित कर रहे हैं। इस चरण के बाद किसी इंटरनेट कनेक्शन की आवश्यकता नहीं होगी।'
              : 'ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯ ಭಾಷಾ ಸಂಶ್ಲೇಷಣೆ ಮತ್ತು ತರ್ಕ ಎಂಜಿನ್‌ಗಳನ್ನು ನಾವು ಸ್ಥಾಪಿಸುತ್ತಿದ್ದೇವೆ. ಈ ಹಂತದ ನಂತರ ಯಾವುದೇ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕದ ಅಗತ್ಯವಿರುವುದಿಲ್ಲ.'}
        </AppText>

        <Card style={styles.statusCard}>
          {isDownloading && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
          )}
          <AppText variant="bodyLg" style={styles.statusText} color={colors.textPrimary}>
            {getStatusText()}
          </AppText>

          <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.success, width: `${downloadProgress}%` }
              ]}
            />
          </View>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          title={language === 'en' ? 'Start Learning' : language === 'hi' ? 'पढ़ना शुरू करें' : 'ಕಲಿಕೆ ಆರಂಭಿಸಿ'}
          disabled={isDownloading}
          onPress={handleFinish}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: 20,
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  statusCard: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 10,
  },
  statusText: {
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    marginTop: 20,
    width: '100%',
  },
});
