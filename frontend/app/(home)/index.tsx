import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { TutorBubble } from '../components/TutorBubble';
import { SubjectCard } from '../components/SubjectCard';
import { ContinueCard } from '../components/ContinueCard';
import { AchievementBadge } from '../components/AchievementBadge';
import { SectionHeader } from '../components/SectionHeader';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject, removeItem } from '@/utils/storage';
import { apiFetch } from '@/services/api';

import { SkeletonLoader } from '../components/SkeletonLoader';

interface SubjectItem {
  id: string;
  name: string;
  nameKey: 'subjectMath' | 'subjectScience' | 'subjectSocial' | 'subjectEnglish' | 'subjectKannada';
  desc: { en: string; hi: string; kn: string };
  topicCount: number;
  progressPercent: number;
  iconName: string;
}

const SUBJECTS_DATA: SubjectItem[] = [
  {
    id: 'math',
    name: 'Mathematics',
    nameKey: 'subjectMath',
    desc: {
      en: 'Numbers, fractions, algebra, and shapes.',
      hi: 'संख्याएँ, भिन्न, बीजगणित, और आकार।',
      kn: 'ಸಂಖ್ಯೆಗಳು, ಭಿನ್ನರಾಶಿಗಳು, ಬೀಜಗಣಿತ ಮತ್ತು ಆಕಾರಗಳು.',
    },
    topicCount: 4,
    progressPercent: 40,
    iconName: 'Calculator',
  },
  {
    id: 'science',
    name: 'Science',
    nameKey: 'subjectScience',
    desc: {
      en: 'Matter, force, energy, plants, and animals.',
      hi: 'पदार्थ, बल, ऊर्जा, पौधे, और जानवर।',
      kn: 'ದ್ರವ್ಯ, ಬಲ, ಶಕ್ತಿ, ಸಸ್ಯಗಳು ಮತ್ತು ಪ್ರಾಣಿಗಳು.',
    },
    topicCount: 3,
    progressPercent: 20,
    iconName: 'FlaskConical',
  },
  {
    id: 'social',
    name: 'Social Studies',
    nameKey: 'subjectSocial',
    desc: {
      en: 'Our history, earth geography, and community life.',
      hi: 'हमारा इतिहास, पृथ्वी का भूगोल, और सामुदायिक जीवन।',
      kn: 'ನಮ್ಮ ಇತಿಹಾಸ, ಭೂಗೋಳ ಮತ್ತು ಸಾಮುದಾಯಿಕ ಜೀವನ.',
    },
    topicCount: 2,
    progressPercent: 0,
    iconName: 'Globe',
  },
  {
    id: 'english',
    name: 'English',
    nameKey: 'subjectEnglish',
    desc: {
      en: 'Grammar, reading comprehension, and creative writing.',
      hi: 'व्याकरण, पढ़ने की समझ, और रचनात्मक लेखन।',
      kn: 'ವ್ಯಾಕರಣ, ಓದುವ ಗ್ರಹಿಕೆ ಮತ್ತು ಸೃಜನಶೀಲ ಬರವಣಿಗೆ.',
    },
    topicCount: 3,
    progressPercent: 65,
    iconName: 'BookOpen',
  },
  {
    id: 'kannada',
    name: 'Kannada',
    nameKey: 'subjectKannada',
    desc: {
      en: 'Kannada literature, grammar, and sentence structures.',
      hi: 'कन्नड़ साहित्य, व्याकरण, और वाक्य संरचनाएँ।',
      kn: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ, ವ್ಯಾಕರಣ ಮತ್ತು ವಾಕ್ಯ ರಚನೆಗಳು.',
    },
    topicCount: 2,
    progressPercent: 50,
    iconName: 'Languages',
  },
];

const BADGES_DATA = [
  { emoji: '🏆', name: 'First Steps', description: 'Finished your first AI lesson room session.', unlocked: true, unlockedAt: 'Yesterday' },
  { emoji: '🔥', name: 'Quiz Whiz', description: 'Scored 100% correct in any quiz.', unlocked: true, unlockedAt: '2 days ago' },
  { emoji: '🎒', name: 'Dedicated Learner', description: 'Study for 5 consecutive days.', unlocked: false },
];

function mapCurriculumToSubjects(nodes: any[]): SubjectItem[] {
  const concepts = nodes.filter(n => n.nodeType === 'concept');
  return concepts.map(concept => {
    const name = concept.name;
    let nameKey: any = 'subjectMath';
    let iconName = 'BookOpen';
    
    if (name.toLowerCase().includes('math')) {
      nameKey = 'subjectMath';
      iconName = 'Calculator';
    } else if (name.toLowerCase().includes('science')) {
      nameKey = 'subjectScience';
      iconName = 'FlaskConical';
    } else if (name.toLowerCase().includes('social')) {
      nameKey = 'subjectSocial';
      iconName = 'Globe';
    } else if (name.toLowerCase().includes('english')) {
      nameKey = 'subjectEnglish';
      iconName = 'BookOpen';
    } else if (name.toLowerCase().includes('kannada')) {
      nameKey = 'subjectKannada';
      iconName = 'Languages';
    }
    
    // Count child topics
    const childTopics = nodes.filter(n => 
      n.nodeType === 'topic' && 
      (n.parent === concept._id || (n.parent && n.parent._id === concept._id))
    );
    
    const description = concept.metadata?.description || {
      en: `Learn about ${name} and master key skills.`,
      hi: `${name} के बारे में जानें और कौशल हासिल करें।`,
      kn: `${name} ಬಗ್ಗೆ ತಿಳಿಯಿರಿ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳಿ.`
    };
    
    return {
      id: concept._id,
      name,
      nameKey,
      desc: typeof description === 'string' ? { en: description, hi: description, kn: description } : description,
      topicCount: childTopics.length || 1,
      progressPercent: 0,
      iconName
    };
  });
}

export default function Home(): React.JSX.Element {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { colors, spacing } = useTheme();
  
  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resumeData, setResumeData] = useState<{ subject: string; topic: string; progress: number } | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>(SUBJECTS_DATA);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        // Load profile info
        const savedProfile = await getObject<{ name: string }>(STORAGE_KEYS.STUDENT_PROFILE);
        setProfile(savedProfile);
        
        // Load simulated recent activity
        setResumeData({
          subject: 'Mathematics',
          topic: 'Fractions & Decimals',
          progress: 35
        });

        // Load dynamic subjects
        try {
          const response = await apiFetch('/api/v1/curriculum');
          if (response.ok) {
            const res = await response.json();
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
              const mapped = mapCurriculumToSubjects(res.data);
              if (mapped.length > 0) {
                setSubjects(mapped);
                console.log('[Home Integration] Loaded dynamic concepts from backend:', mapped.map(s => s.name));
              }
            }
          }
        } catch (apiErr: any) {
          console.log('[Home Integration] Server offline or database down, using local subjects list:', apiErr.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleReset = async () => {
    await removeItem(STORAGE_KEYS.ONBOARDING_DONE);
    await removeItem(STORAGE_KEYS.STUDENT_PROFILE);
    await removeItem(STORAGE_KEYS.SELECTED_LANGUAGE);
    await removeItem(STORAGE_KEYS.MODELS_READY);
    router.replace('/(onboarding)/welcome');
  };

  const studentName = profile?.name || (language === 'en' ? 'Friend' : language === 'hi' ? 'दोस्त' : 'ಸ್ನೇಹಿತರೇ');

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        <View style={[styles.scrollContent, { paddingHorizontal: spacing.space5, paddingVertical: spacing.space6, gap: 16 }]}>
          {/* Header row skeleton */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 8, flex: 1 }}>
              <SkeletonLoader variant="rect" width="55%" height={26} />
              <SkeletonLoader variant="rect" width="40%" height={16} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SkeletonLoader variant="circle" width={44} height={44} />
              <SkeletonLoader variant="circle" width={44} height={44} />
            </View>
          </View>

          {/* Tutor bubble skeleton */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <SkeletonLoader variant="circle" width={44} height={44} />
            <SkeletonLoader variant="rect" width="82%" height={60} style={{ borderRadius: 12 }} />
          </View>

          {/* Continue Card skeleton */}
          <View style={{ marginTop: 10 }}>
            <SkeletonLoader variant="rect" width="100%" height={100} style={{ borderRadius: 16 }} />
          </View>

          {/* Subjects title skeleton */}
          <SkeletonLoader variant="rect" width="40%" height={22} style={{ marginTop: 10 }} />

          {/* Subject card skeletons */}
          <View style={{ gap: 14 }}>
            <SkeletonLoader variant="card" width="100%" />
            <SkeletonLoader variant="card" width="100%" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.space5, paddingVertical: spacing.space6 },
        ]}
      >
        {/* Header greeting and fast access buttons */}
        <View style={styles.headerContainer}>
          <View style={styles.headerText}>
            <AppText variant="display" color={colors.primary} style={styles.greeting}>
              {language === 'en' ? `Hello, ${studentName}!` : language === 'hi' ? `नमस्ते, ${studentName}!` : `ನಮಸ್ಕಾರ, ${studentName}!`}
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {language === 'en' ? "Welcome back to Lernzy!" : language === 'hi' ? "लर्नज़ी में आपका स्वागत है!" : "ಲರ್ನ್ಜಿಗೆ ಮರಳಿ ಸ್ವಾಗತ!"}
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
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="View progress statistics"
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
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open settings configuration"
            >
              <AppText variant="heading2">⚙️</AppText>
            </Pressable>
          </View>
        </View>

        {/* Conversational speech bubble */}
        <View style={styles.tutorContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
            <AppText variant="heading1" color={colors.primary}>V</AppText>
          </View>
          <TutorBubble
            message={language === 'en'
              ? `Hey ${studentName}! Are you ready to level up your knowledge? Let's start learning now!`
              : language === 'hi'
              ? `हे ${studentName}! क्या आप अपने ज्ञान को बढ़ाने के लिए तैयार हैं? आइए अभी सीखना शुरू करें!`
              : `ಹೇ ${studentName}! ನಿಮ್ಮ ಜ್ಞಾನವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಲು ಸಿದ್ಧರಿದ್ದೀರಾ? ಬನ್ನಿ ಈಗಲೇ ಕಲಿಯಲು ಆರಂಭಿಸೋಣ!`}
            style={styles.bubble}
          />
        </View>

        {/* Continue learning block */}
        <SectionHeader title={language === 'en' ? 'Continue Learning' : language === 'hi' ? 'पढ़ना जारी रखें' : 'ಕಲಿಕೆಯನ್ನು ಮುಂದುವರಿಸಿ'} />
        {resumeData ? (
          <View style={styles.sectionContainer}>
            <ContinueCard
              subjectName={resumeData.subject}
              topicName={resumeData.topic}
              progressPercent={resumeData.progress}
              onResume={() => router.push({
                pathname: '/(home)/lesson/[topicId]',
                params: { topicId: 'fractions' }
              })}
            />
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <Pressable
              onPress={() => {}}
              style={[styles.emptyCard, { backgroundColor: colors.surfaceAlt }]}
            >
              <AppText variant="bodyLg" color={colors.textSecondary}>
                No active lessons. Select a subject below to begin!
              </AppText>
            </Pressable>
          </View>
        )}

        {/* Subject cards listing */}
        <SectionHeader title={language === 'en' ? 'Your Subjects' : language === 'hi' ? 'आपके विषय' : 'ನಿಮ್ಮ ವಿಷಯಗಳು'} />
        <View style={styles.subjectsList}>
          {subjects.map((sub) => {
            const localizedDesc = sub.desc[language] || sub.desc.en;
            return (
              <SubjectCard
                key={sub.id}
                id={sub.id}
                name={t(sub.nameKey)}
                description={localizedDesc}
                topicCount={sub.topicCount}
                progressPercent={sub.progressPercent}
                iconName={sub.iconName}
                onPress={() => router.push({
                  pathname: '/(home)/subject/[id]',
                  params: { id: sub.id }
                })}
              />
            );
          })}
        </View>

        {/* Achievement badges listing */}
        <SectionHeader
          title={language === 'en' ? 'Milestones & Badges' : language === 'hi' ? 'मील के पत्थर और बैज' : 'ಮೈಲಿಗಲ್ಲುಗಳು & ಬ್ಯಾಡ್ಜ್‌ಗಳು'}
          actionText={language === 'en' ? 'See All' : language === 'hi' ? 'सभी देखें' : 'ಎಲ್ಲಾ ನೋಡಿ'}
          onActionPress={() => router.push('/(home)/progress')}
        />
        <View style={styles.badgesList}>
          {BADGES_DATA.map((badge, idx) => (
            <AchievementBadge
              key={idx}
              emoji={badge.emoji}
              name={badge.name}
              description={badge.description}
              unlocked={badge.unlocked}
              unlockedAt={badge.unlockedAt}
            />
          ))}
        </View>

        {/* Debug resetting widget */}
        <Button
          variant="ghost"
          title={language === 'en' ? 'Restart Lernzy Onboarding' : language === 'hi' ? 'लर्नज़ी ऑनबोर्डिंग पुनः प्रारंभ करें' : 'ಲರ್ನ್ಜಿ ಆನ್ಬೋರ್ಡಿಂಗ್ ಮರುಪ್ರಾರಂಭಿಸಿ'}
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
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontWeight: '700',
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
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  sectionContainer: {
    marginBottom: 16,
  },
  subjectsList: {
    gap: 14,
    marginBottom: 16,
  },
  badgesList: {
    gap: 10,
    marginBottom: 20,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  resetBtn: {
    marginTop: 20,
  },
});
