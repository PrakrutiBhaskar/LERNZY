import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme, useSubjectColor } from '@/theme/theme';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TutorBubble } from '../components/TutorBubble';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, removeItem } from '@/utils/storage';

interface SubjectItem {
  id: string;
  nameKey: 'subjectMath' | 'subjectScience' | 'subjectSocial' | 'subjectEnglish' | 'subjectKannada';
  subjectKey: string;
  desc: { en: string; hi: string; kn: string };
}

const SUBJECTS: SubjectItem[] = [
  {
    id: 'math',
    nameKey: 'subjectMath',
    subjectKey: 'Mathematics',
    desc: {
      en: 'Numbers, fractions, algebra, and shapes.',
      hi: 'संख्याएँ, भिन्न, बीजगणित, और आकार।',
      kn: 'ಸಂಖ್ಯೆಗಳು, ಭಿನ್ನರಾಶಿಗಳು, ಬೀಜಗಣಿತ ಮತ್ತು ಆಕಾರಗಳು.',
    },
  },
  {
    id: 'science',
    nameKey: 'subjectScience',
    subjectKey: 'Science',
    desc: {
      en: 'Matter, force, energy, plants, and animals.',
      hi: 'पदार्थ, बल, ऊर्जा, पौधे, और जानवर।',
      kn: 'ದ್ರವ್ಯ, ಬಲ, ಶಕ್ತಿ, ಸಸ್ಯಗಳು ಮತ್ತು ಪ್ರಾಣಿಗಳು.',
    },
  },
  {
    id: 'social',
    nameKey: 'subjectSocial',
    subjectKey: 'Social Studies',
    desc: {
      en: 'Our history, earth geography, and community life.',
      hi: 'हमारा इतिहास, पृथ्वी का भूगोल, और सामुदायिक जीवन।',
      kn: 'ನಮ್ಮ ಇತಿಹಾಸ, ಭೂಗೋಳ ಮತ್ತು ಸಾಮುದಾಯಿಕ ಜೀವನ.',
    },
  },
  {
    id: 'english',
    nameKey: 'subjectEnglish',
    subjectKey: 'English',
    desc: {
      en: 'Grammar, reading comprehension, and creative writing.',
      hi: 'व्याकरण, पढ़ने की समझ, और रचनात्मक लेखन।',
      kn: 'ವ್ಯಾಕರಣ, ಓದುವ ಗ್ರಹಿಕೆ ಮತ್ತು ಸೃಜನಶೀಲ ಬರವಣಿಗೆ.',
    },
  },
  {
    id: 'kannada',
    nameKey: 'subjectKannada',
    subjectKey: 'Kannada',
    desc: {
      en: 'Kannada literature, grammar, and sentence structures.',
      hi: 'कन्नड़ साहित्य, व्याकरण, और वाक्य संरचनाएँ।',
      kn: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ, ವ್ಯಾಕರಣ ಮತ್ತು ವಾಕ್ಯ ರಚನೆಗಳು.',
    },
  },
];

export default function Home(): React.JSX.Element {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { colors, spacing } = useTheme();
  
  const [profile, setProfile] = useState<{ name: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await getObject<{ name: string }>(STORAGE_KEYS.STUDENT_PROFILE);
      setProfile(data);
    }
    loadProfile();
  }, []);

  const handleReset = async () => {
    await removeItem(STORAGE_KEYS.ONBOARDING_DONE);
    await removeItem(STORAGE_KEYS.STUDENT_PROFILE);
    await removeItem(STORAGE_KEYS.SELECTED_LANGUAGE);
    router.replace('/(onboarding)/welcome');
  };

  const studentName = profile?.name || (language === 'en' ? 'Friend' : language === 'hi' ? 'दोस्त' : 'ಸ್ನೇಹಿತರೇ');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.space5, paddingVertical: spacing.space6 },
        ]}
      >
        {/* Profile / Greeting Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerText}>
            <AppText variant="display" color={colors.primary} style={styles.greeting}>
              {language === 'en' ? `Hello, ${studentName}!` : language === 'hi' ? `नमस्ते, ${studentName}!` : `ನಮಸ್ಕಾರ, ${studentName}!`}
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {language === 'en' ? "Let's explore and learn something new!" : language === 'hi' ? "आइए कुछ नया खोजें और सीखें!" : "ಬನ್ನಿ, ಹೊಸದನ್ನು ಅನ್ವೇಷಿಸೋಣ ಮತ್ತು ಕಲಿಯೋಣ!"}
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/(home)/progress')}
              style={({ pressed }) => [
                styles.circleAction,
                { backgroundColor: colors.surfaceAlt },
                pressed && { opacity: 0.7 }
              ]}
            >
              <AppText variant="heading2">📈</AppText>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(home)/settings')}
              style={({ pressed }) => [
                styles.circleAction,
                { backgroundColor: colors.surfaceAlt },
                pressed && { opacity: 0.7 }
              ]}
            >
              <AppText variant="heading2">⚙️</AppText>
            </Pressable>
          </View>
        </View>

        {/* AI Tutor Speech Bubble greeting */}
        <View style={styles.tutorContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
            <AppText variant="heading1" color={colors.primary}>V</AppText>
          </View>
          <TutorBubble
            message={t('tutorGreeting')}
            style={styles.bubble}
          />
        </View>

        {/* Subjects Heading */}
        <View style={styles.sectionHeader}>
          <AppText variant="heading1" style={styles.sectionTitle}>
            {language === 'en' ? 'Your Subjects' : language === 'hi' ? 'आपके विषय' : 'ನಿಮ್ಮ ವಿಷಯಗಳು'}
          </AppText>
        </View>

        {/* Single Column Subject Cards Layout */}
        <View style={styles.subjectsList}>
          {SUBJECTS.map((sub) => {
            const subjectColor = useSubjectColor(sub.subjectKey);
            const localizedDesc = sub.desc[language] || sub.desc.en;

            return (
              <Card
                key={sub.id}
                onPress={() => {
                  router.push({
                    pathname: '/(home)/subject/[id]',
                    params: { id: sub.id }
                  });
                }}
                style={[
                  styles.subjectCard,
                  { borderLeftWidth: 5, borderLeftColor: subjectColor }
                ]}
              >
                <View style={styles.cardHeader}>
                  <AppText variant="heading2" style={styles.subjectName}>
                    {t(sub.nameKey)}
                  </AppText>
                  <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {language === 'en' ? 'Topic 1' : language === 'hi' ? 'विषय 1' : 'ವಿಷಯ 1'}
                    </AppText>
                  </View>
                </View>
                <AppText variant="body" color={colors.textSecondary} style={styles.subjectDesc}>
                  {localizedDesc}
                </AppText>
                
                {/* Lightweight progress indicator */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceAlt }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { backgroundColor: subjectColor, width: '40%' }
                      ]}
                    />
                  </View>
                  <AppText variant="caption" color={colors.textSecondary} style={styles.progressText}>
                    40% {language === 'en' ? 'Done' : language === 'hi' ? 'पूर्ण' : 'ಪೂರ್ಣಗೊಂಡಿದೆ'}
                  </AppText>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Developer Reset Option */}
        <Button
          variant="ghost"
          title={language === 'en' ? 'Reset App (Restart Onboarding)' : language === 'hi' ? 'ऐप रीसेट करें (पुनः प्रारंभ करें)' : 'ಆಪ್ ರಿಸೆಟ್ ಮಾಡಿ (ಮತ್ತೆ ಕಲಿಕೆ ಆರಂಭಿಸಿ)'}
          onPress={handleReset}
          style={styles.resetBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  circleAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontWeight: '700',
  },
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  subjectsList: {
    gap: 16,
    marginBottom: 32,
  },
  subjectCard: {
    paddingLeft: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectName: {
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  subjectDesc: {
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontWeight: '600',
  },
  resetBtn: {
    marginTop: 'auto',
  },
});
