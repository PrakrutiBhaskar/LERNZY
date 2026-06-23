import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { ScreenContainer } from '../../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject } from '@/utils/storage';
import { useAuth } from '@/services/auth';
import { syncQueuedEvents } from '@/services/sync';

export default function AuthScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();
  const { user, isAuthenticated, isLoading, login, signup, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Local profile cache
  const [localProfile, setLocalProfile] = useState<any>(null);

  useEffect(() => {
    async function loadLocalProfile() {
      const profile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
      if (profile) {
        setLocalProfile(profile);
        if (profile.name) {
          setName(profile.name);
        }
      }
    }
    loadLocalProfile();
  }, []);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        language === 'en' ? 'Validation Error' : 'त्रुटि',
        language === 'en' ? 'Please fill in all credentials.' : 'कृपया सभी क्रेडेंशियल भरें।'
      );
      return;
    }

    setActionLoading(true);
    try {
      if (activeTab === 'login') {
        await login(email.trim().toLowerCase(), password);
        Alert.alert(
          language === 'en' ? 'Success' : 'सफलता',
          language === 'en' ? 'Successfully logged in!' : 'सफलतापूर्वक लॉग इन किया गया!'
        );
      } else {
        if (!name.trim()) {
          Alert.alert(
            language === 'en' ? 'Validation Error' : 'त्रुटि',
            language === 'en' ? 'Please enter your name.' : 'कृपया अपना नाम दर्ज करें।'
          );
          setActionLoading(false);
          return;
        }

        // Pass offline local profile attributes to map details
        await signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          preferredLanguage: localProfile?.language || language || 'en',
          educationLevel: localProfile?.learningStyle === 'story' ? 'beginner' : 'intermediate',
          grade: localProfile?.grade ? parseInt(localProfile.grade, 10) : 6,
          interests: localProfile?.interests || [],
        });

        Alert.alert(
          language === 'en' ? 'Account Created' : 'खाता बनाया गया',
          language === 'en' 
            ? 'Your cloud learning profile is ready and synced.' 
            : 'आपका क्लाउड लर्निंग प्रोफाइल तैयार और सिंक हो गया है।'
        );
      }
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(home)');
      }
    } catch (err: any) {
      Alert.alert(
        language === 'en' ? 'Authentication Failed' : 'प्रमाणीकरण विफल',
        err.message || 'An error occurred during authentication.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      await syncQueuedEvents();
      Alert.alert(
        language === 'en' ? 'Sync Complete' : 'सिंक पूरा हुआ',
        language === 'en' ? 'All offline progress synced successfully!' : 'सभी ऑफ़लाइन प्रगति सफलतापूर्वक सिंक हो गई!'
      );
    } catch (err: any) {
      Alert.alert(
        language === 'en' ? 'Sync Failed' : 'सिंक विफल',
        err.message || 'Please check your connection and try again.'
      );
    } finally {
      setSyncLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      language === 'en' ? 'Confirm Log Out' : 'लॉग आउट की पुष्टि करें',
      language === 'en' 
        ? 'Are you sure you want to log out? Local data will remain intact.' 
        : 'क्या आप निश्चित रूप से लॉग आउट करना चाहते हैं? स्थानीय डेटा सुरक्षित रहेगा।',
      [
        { text: language === 'en' ? 'Cancel' : 'रद्द करें', style: 'cancel' },
        { 
          text: language === 'en' ? 'Log Out' : 'लॉग आउट', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await logout();
              Alert.alert(
                language === 'en' ? 'Logged Out' : 'लॉग आउट हो गए',
                language === 'en' ? 'Session cleared successfully.' : 'सत्र सफलतापूर्वक साफ़ हो गया।'
              );
            } catch (e) {
              console.error(e);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer
      title={language === 'en' ? 'Cloud Sync' : 'क्लाउड सिंक'}
      subtitle={language === 'en' ? 'Back up and restore your learning journey' : 'अपनी सीखने की यात्रा का बैकअप लें और पुनर्स्थापित करें'}
      showBackButton={true}
    >
      {isAuthenticated && user ? (
        <View style={styles.content}>
          <Card style={styles.successCard}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.success + '15' }]}>
              <AppText variant="display" color={colors.success}>☁️</AppText>
            </View>
            <AppText variant="heading2" style={styles.cardTitle} color={colors.textPrimary}>
              {language === 'en' ? 'Syncing Active' : 'सिंक सक्रिय है'}
            </AppText>
            
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.infoRow}>
                <AppText variant="bodyLg" color={colors.textSecondary}>{language === 'en' ? 'Name:' : 'नाम:'}</AppText>
                <AppText variant="bodyLg" style={styles.infoVal}>{user.name}</AppText>
              </View>
              <View style={styles.infoRow}>
                <AppText variant="bodyLg" color={colors.textSecondary}>{language === 'en' ? 'Email:' : 'ईमेल:'}</AppText>
                <AppText variant="bodyLg" style={styles.infoVal}>{user.email}</AppText>
              </View>
              <View style={styles.infoRow}>
                <AppText variant="bodyLg" color={colors.textSecondary}>{language === 'en' ? 'Learning Points:' : 'लर्निंग पॉइंट्स:'}</AppText>
                <AppText variant="bodyLg" style={[styles.infoVal, { color: colors.primary, fontWeight: '700' }]}>{user.points || 0} XP</AppText>
              </View>
            </View>

            <View style={styles.btnCol}>
              <Button
                title={language === 'en' ? 'Sync Local Progress Now' : 'अब स्थानीय प्रगति सिंक करें'}
                loading={syncLoading}
                onPress={handleManualSync}
                style={styles.syncBtn}
              />
              <Button
                variant="ghost"
                title={language === 'en' ? 'Disconnect / Log Out' : 'डिस्कनेक्ट / लॉग आउट'}
                disabled={actionLoading}
                onPress={handleLogout}
                style={{ backgroundColor: colors.surfaceAlt }}
              />
            </View>
          </Card>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={[styles.tabRow, { backgroundColor: colors.surfaceAlt }]}>
            <Button
              variant={activeTab === 'login' ? 'primary' : 'ghost'}
              title={language === 'en' ? 'Log In' : 'लॉग इन'}
              onPress={() => setActiveTab('login')}
              style={styles.tabBtn}
            />
            <Button
              variant={activeTab === 'signup' ? 'primary' : 'ghost'}
              title={language === 'en' ? 'Create Cloud Backup' : 'क्लाउड बैकअप बनाएं'}
              onPress={() => setActiveTab('signup')}
              style={styles.tabBtn}
            />
          </View>

          <Card style={styles.formCard}>
            <AppText variant="bodyLg" color={colors.textSecondary} style={styles.formPrompt}>
              {activeTab === 'login'
                ? (language === 'en' ? 'Enter credentials to restore your progress and sync achievements.' : 'अपनी प्रगति को पुनर्स्थापित करने और उपलब्धियों को सिंक करने के लिए क्रेडेंशियल दर्ज करें।')
                : (language === 'en' ? 'Connect this phone data to a cloud account so you never lose your progress.' : 'इस फ़ोन डेटा को क्लाउड खाते से कनेक्ट करें ताकि आप अपनी प्रगति कभी न खोएं।')}
            </AppText>

            {activeTab === 'signup' && (
              <InputField
                label={language === 'en' ? 'Name' : 'नाम'}
                placeholder={language === 'en' ? 'Your full name...' : 'आपका पूरा नाम...'}
                value={name}
                onChangeText={setName}
                containerStyle={styles.input}
              />
            )}

            <InputField
              label={language === 'en' ? 'Email' : 'ईमेल'}
              placeholder={language === 'en' ? 'student@example.com' : 'student@example.com'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.input}
            />

            <InputField
              label={language === 'en' ? 'Password' : 'पासवर्ड'}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              containerStyle={styles.input}
            />

            <Button
              title={
                activeTab === 'login' 
                  ? (language === 'en' ? 'Log In & Restore' : 'लॉग इन और पुनर्स्थापित करें') 
                  : (language === 'en' ? 'Sign Up & Sync' : 'साइन अप और सिंक करें')
              }
              loading={actionLoading}
              onPress={handleAuth}
              style={styles.actionBtn}
            />
          </Card>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    gap: 20,
    marginTop: 10,
  },
  successCard: {
    padding: 24,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
    padding: 16,
    borderRadius: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoVal: {
    fontWeight: '600',
  },
  btnCol: {
    width: '100%',
    gap: 12,
  },
  syncBtn: {
    width: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 24,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
  },
  formCard: {
    padding: 20,
  },
  formPrompt: {
    lineHeight: 20,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  actionBtn: {
    width: '100%',
    marginTop: 8,
  },
});
