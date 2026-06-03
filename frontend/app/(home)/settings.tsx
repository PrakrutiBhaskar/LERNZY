import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { ScreenContainer } from '../../components/ScreenContainer';
import { STORAGE_KEYS, LanguageCode } from '@/utils/constants';
import { getObject, setObject, removeItem } from '@/utils/storage';
import { useAuth } from '@/services/auth';
import { Moon, Sun } from 'lucide-react-native';

export default function SettingsScreen(): React.JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { colors, mode, toggleMode } = useTheme();

  const [name, setName] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
      if (data) {
        setProfile(data);
        setName(data.name || '');
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) return;

    try {
      const updatedProfile = { ...profile, name: name.trim() };
      await setObject(STORAGE_KEYS.STUDENT_PROFILE, updatedProfile);
      setProfile(updatedProfile);
      Alert.alert(
        language === 'en' ? 'Success' : language === 'hi' ? 'सफलता' : 'ಯಶಸ್ಸು',
        language === 'en' ? 'Profile updated successfully!' : language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!' : 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲ್ಪಟ್ಟಿದೆ!'
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleLanguageChange = async (lang: LanguageCode) => {
    await setLanguage(lang);
    if (profile) {
      const updatedProfile = { ...profile, language: lang };
      await setObject(STORAGE_KEYS.STUDENT_PROFILE, updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const handleResetApp = async () => {
    await removeItem(STORAGE_KEYS.ONBOARDING_DONE);
    await removeItem(STORAGE_KEYS.STUDENT_PROFILE);
    await removeItem(STORAGE_KEYS.SELECTED_LANGUAGE);
    await removeItem(STORAGE_KEYS.MODELS_READY);
    router.replace('/(onboarding)/welcome');
  };

  return (
    <ScreenContainer
      title={language === 'en' ? 'Settings' : language === 'hi' ? 'सेटिंग्स' : 'ಸಂಯೋಜನೆಗಳು'}
      subtitle={language === 'en' ? 'Manage your account and AI settings' : language === 'hi' ? 'अपने खाते और एआई सेटिंग्स प्रबंधित करें' : 'ಖಾತೆ ಮತ್ತು ಎಐ ಸಂಯೋಜನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ'}
      showBackButton={true}
      scrollable={true}
    >
      <View style={styles.container}>
        {/* Profile Card */}
        <Card style={styles.settingsCard}>
          <AppText variant="heading2" style={styles.sectionTitle}>
            {language === 'en' ? 'Edit Profile' : language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'ಪ್ರೊಫೈಲ್ ತಿದ್ದಿ'}
          </AppText>
          <InputField
            label={language === 'en' ? 'Name' : language === 'hi' ? 'नाम' : 'ಹೆಸರು'}
            value={name}
            onChangeText={setName}
            containerStyle={styles.input}
          />
          <Button
            title={language === 'en' ? 'Save Changes' : language === 'hi' ? 'बदलाव सहेजें' : 'ಬದಲಾವಣೆ ಉಳಿಸಿ'}
            onPress={handleSaveProfile}
            style={styles.saveBtn}
          />
        </Card>

        {/* Cloud Sync Card */}
        <Card style={styles.settingsCard}>
          <AppText variant="heading2" style={styles.sectionTitle}>
            {language === 'en' ? 'Cloud Synchronization' : language === 'hi' ? 'क्लाउड सिंक्रोनाइजेशन' : 'ಕ್ಲೌಡ್ ಸಿಂಕ್'}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: 12, lineHeight: 20 }}>
            {isAuthenticated && user
              ? (language === 'en' 
                ? `Logged in as ${user.email}. Offline progress and achievements are backing up automatically.` 
                : `${user.email} के रूप में लॉग इन हैं। ऑफ़लाइन प्रगति और उपलब्धियां स्वचालित रूप से सिंक हो रही हैं।`)
              : (language === 'en' 
                ? 'Back up your progress, study points, and achievements to the cloud to restore them anytime.' 
                : 'अपनी प्रगति, स्टडी पॉइंट्स और उपलब्धियों का क्लाउड पर बैकअप लें ताकि उन्हें कभी भी रीस्टोर किया जा सके।')}
          </AppText>
          <Button
            title={
              isAuthenticated
                ? (language === 'en' ? 'Manage Cloud Sync' : 'क्लाउड सिंक प्रबंधित करें')
                : (language === 'en' ? 'Connect Cloud Account' : 'क्लाउड खाता कनेक्ट करें')
            }
            onPress={() => router.push('/(home)/auth')}
            style={styles.saveBtn}
          />
        </Card>

        {/* Language Selection Card */}
        <Card style={styles.settingsCard}>
          <AppText variant="heading2" style={styles.sectionTitle}>
            {language === 'en' ? 'UI Language' : language === 'hi' ? 'यूआई भाषा' : 'ಭಾಷೆ ಬದಲಿಸಿ'}
          </AppText>
          <View style={styles.langRow}>
            <Button
              variant={language === 'en' ? 'primary' : 'secondary'}
              title="English"
              onPress={() => handleLanguageChange('en')}
              style={styles.langBtn}
            />
            <Button
              variant={language === 'hi' ? 'primary' : 'secondary'}
              title="हिन्दी"
              onPress={() => handleLanguageChange('hi')}
              style={styles.langBtn}
            />
            <Button
              variant={language === 'kn' ? 'primary' : 'secondary'}
              title="ಕನ್ನಡ"
              onPress={() => handleLanguageChange('kn')}
              style={styles.langBtn}
            />
          </View>
        </Card>

        {/* Appearance Card */}
        <Card style={styles.settingsCard}>
          <View style={styles.appearanceRow}>
            <View style={styles.appearanceCopy}>
              <AppText variant="heading2" style={styles.appearanceTitle}>
                {language === 'en' ? 'Appearance' : language === 'hi' ? 'थीम' : 'ಥೀಮ್'}
              </AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {mode === 'dark'
                  ? (language === 'en' ? 'Dark theme is active' : language === 'hi' ? 'डार्क थीम सक्रिय है' : 'ಡಾರ್ಕ್ ಥೀಮ್ ಸಕ್ರಿಯವಾಗಿದೆ')
                  : (language === 'en' ? 'Light theme is active' : language === 'hi' ? 'लाइट थीम सक्रिय है' : 'ಲೈಟ್ ಥೀಮ್ ಸಕ್ರಿಯವಾಗಿದೆ')}
              </AppText>
            </View>
            <Pressable
              onPress={toggleMode}
              accessibilityRole="switch"
              accessibilityState={{ checked: mode === 'dark' }}
              accessibilityLabel="Toggle dark theme"
              style={({ pressed }) => [
                styles.themeSwitch,
                { backgroundColor: mode === 'dark' ? colors.primaryContainer : colors.surfaceContainerHighest },
                pressed && { opacity: 0.82 },
              ]}
            >
              <View
                style={[
                  styles.themeThumb,
                  {
                    backgroundColor: colors.surface,
                    transform: [{ translateX: mode === 'dark' ? 28 : 0 }],
                  },
                ]}
              >
                {mode === 'dark'
                  ? <Moon size={16} strokeWidth={2.5} color={colors.primary} />
                  : <Sun size={16} strokeWidth={2.5} color={colors.primary} />}
              </View>
            </Pressable>
          </View>
        </Card>

        {/* Offline AI Model Info Card */}
        <Card style={styles.settingsCard}>
          <AppText variant="heading2" style={styles.sectionTitle}>
            {language === 'en' ? 'Offline AI Engines' : language === 'hi' ? 'ऑफ़लाइन एआई इंजन' : 'ಆಫ್‌ಲೈನ್ ಎಐ ಎಂಜಿನ್‌ಗಳು'}
          </AppText>
          <View style={styles.modelRow}>
            <AppText variant="bodyLg" style={styles.modelName}>Phi-3 Mini LLM</AppText>
            <AppText variant="caption" color={colors.success} style={styles.modelStatus}>
              {language === 'en' ? 'Ready (Downloaded)' : language === 'hi' ? 'तैयार (डाउनलोड किया गया)' : 'ಸಿದ್ಧವಾಗಿದೆ (ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ)'}
            </AppText>
          </View>
          <View style={styles.modelRow}>
            <AppText variant="bodyLg" style={styles.modelName}>Whisper STT</AppText>
            <AppText variant="caption" color={colors.success} style={styles.modelStatus}>
              {language === 'en' ? 'Ready' : language === 'hi' ? 'तैयार' : 'ಸಿದ್ಧವಾಗಿದೆ'}
            </AppText>
          </View>
          <View style={styles.modelRow}>
            <AppText variant="bodyLg" style={styles.modelName}>Piper TTS</AppText>
            <AppText variant="caption" color={colors.success} style={styles.modelStatus}>
              {language === 'en' ? 'Ready' : language === 'hi' ? 'तैयार' : 'ಸಿದ್ಧವಾಗಿದೆ'}
            </AppText>
          </View>
        </Card>

        {/* App Danger Reset Card */}
        <Card style={[styles.settingsCard, { backgroundColor: colors.errorSubtle }]}>
          <AppText variant="heading2" color={colors.error} style={styles.sectionTitle}>
            {language === 'en' ? 'Danger Zone' : language === 'hi' ? 'खतरनाक क्षेत्र' : 'ಅಪಾಯಕಾರಿ ವಲಯ'}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.dangerDesc}>
            {language === 'en' 
              ? 'Resetting the app will clear your name, interests, and redownload local AI models.' 
              : language === 'hi' 
              ? 'ऐप को रीसेट करने से आपका नाम, रुचियां मिट जाएंगी और स्थानीय एआई मॉडल फिर से डाउनलोड होंगे।' 
              : 'ರಿಸೆಟ್ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಹೆಸರು, ಆಸಕ್ತಿಗಳು ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಆದ ಎಐ ಮಾದರಿಗಳು ಅಳಿಸಲ್ಪಡುತ್ತವೆ.'}
          </AppText>
          <Button
            variant="ghost"
            title={language === 'en' ? 'Clear Data & Reset App' : language === 'hi' ? 'डेटा मिटाएं और ऐप रीसेट करें' : 'ಡೇಟಾ ಅಳಿಸಿ ಆಪ್ ರಿಸೆಟ್ ಮಾಡಿ'}
            onPress={handleResetApp}
            style={{ backgroundColor: colors.surfaceAlt }}
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 10,
  },
  settingsCard: {
    padding: 18,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    marginBottom: 12,
  },
  saveBtn: {
    width: '100%',
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
  },
  appearanceRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  appearanceCopy: {
    flex: 1,
  },
  appearanceTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  themeSwitch: {
    width: 68,
    height: 40,
    borderRadius: 20,
    padding: 4,
    justifyContent: 'center',
  },
  themeThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  modelName: {
    fontWeight: '600',
  },
  modelStatus: {
    fontWeight: '700',
  },
  dangerDesc: {
    marginBottom: 16,
    lineHeight: 20,
  },
});
