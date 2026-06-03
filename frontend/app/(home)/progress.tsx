import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Icons from 'lucide-react-native';

import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { apiFetch } from '@/services/api';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SectionHeader } from '../../components/SectionHeader';
import { getDb, isLocalDatabaseAvailable } from '@/db/database';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject } from '@/utils/storage';
import { TOPICS_BY_SUBJECT } from '@/content/learningContent';

type IconName = keyof typeof Icons;

interface SubjectProgress {
  id: string;
  name: string;
  module: string;
  iconName: IconName;
  lessonsCompleted: number;
  lessonsTotal: number;
  masteryPercent: number;
  quizAverage: number;
  minutes: number;
  lastPracticed: string;
}

interface AchievementItem {
  key: string;
  name: string;
  description: string;
  iconName: IconName;
  unlocked: boolean;
  progress: number;
  earnedAt?: string;
}

interface MasteryApiItem {
  module?: string;
  masteryPercentage?: number;
  totalAttempts?: number;
  correctAttempts?: number;
}

interface AchievementApiItem {
  badgeKey?: string;
  earnedAt?: string;
  createdAt?: string;
}

const SUBJECTS_METADATA = [
  { id: 'math', name: 'Mathematics', module: 'math', iconName: 'Calculator' as IconName },
  { id: 'science', name: 'Science', module: 'science', iconName: 'FlaskConical' as IconName },
  { id: 'social', name: 'Social Studies', module: 'social', iconName: 'Globe' as IconName },
  { id: 'english', name: 'English', module: 'english', iconName: 'BookOpen' as IconName },
  { id: 'kannada', name: 'Kannada', module: 'kannada', iconName: 'Languages' as IconName },
  { id: 'coding', name: 'Coding', module: 'coding', iconName: 'Code2' as IconName },
];

const DEFAULT_SUBJECTS: SubjectProgress[] = SUBJECTS_METADATA.map(s => ({
  id: s.id,
  name: s.name,
  module: s.module,
  iconName: s.iconName,
  lessonsCompleted: 0,
  lessonsTotal: 0,
  masteryPercent: 0,
  quizAverage: 0,
  minutes: 0,
  lastPracticed: 'Never',
}));

const WEEKLY_ACTIVITY = [
  { day: 'Mon', minutes: 0 },
  { day: 'Tue', minutes: 0 },
  { day: 'Wed', minutes: 0 },
  { day: 'Thu', minutes: 0 },
  { day: 'Fri', minutes: 0 },
  { day: 'Sat', minutes: 0 },
  { day: 'Sun', minutes: 0 },
];

const ACHIEVEMENT_CATALOG: AchievementItem[] = [
  {
    key: 'first_steps',
    name: 'First Steps',
    description: 'Finish your first lesson room session.',
    iconName: 'Footprints',
    unlocked: false,
    progress: 0,
  },
  {
    key: 'quiz_whiz',
    name: 'Quiz Whiz',
    description: 'Score 100 percent in any quiz.',
    iconName: 'BadgeCheck',
    unlocked: false,
    progress: 0,
  },
  {
    key: 'steady_streak',
    name: 'Steady Streak',
    description: 'Study for 5 days in a row.',
    iconName: 'Flame',
    unlocked: false,
    progress: 0,
  },
  {
    key: 'deep_focus',
    name: 'Deep Focus',
    description: 'Learn for 120 minutes in one week.',
    iconName: 'Timer',
    unlocked: false,
    progress: 0,
  },
];

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function formatEarnedAt(dateValue?: string): string | undefined {
  if (!dateValue) return undefined;

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function getIcon(name: IconName): React.ComponentType<any> {
  return ((Icons as any)[name] || (Icons as any).BookOpen) as React.ComponentType<any>;
}

function normalizeModule(value = ''): string {
  const clean = value.toLowerCase().replace(/[^a-z]/g, '');

  if (clean.includes('math')) return 'math';
  if (clean.includes('science')) return 'science';
  if (clean.includes('english')) return 'english';
  if (clean.includes('coding') || clean.includes('code') || clean.includes('program')) return 'coding';
  if (clean.includes('social')) return 'social';
  if (clean.includes('kannada')) return 'kannada';

  return clean;
}

export default function ProgressScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const [subjects, setSubjects] = useState<SubjectProgress[]>(DEFAULT_SUBJECTS);
  const [achievements, setAchievements] = useState<AchievementItem[]>(ACHIEVEMENT_CATALOG);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Showing saved progress');

  const copy = useMemo(() => {
    const fallback = {
      title: 'My Progress',
      subtitle: 'Your learning map, streaks, badges, and next steps.',
      refresh: 'Refresh',
      continueLearning: 'Continue learning',
      quickStats: 'Overview',
      weeklyActivity: 'Weekly activity',
      subjectMastery: 'Subject mastery',
      quizPerformance: 'Quiz performance',
      achievements: 'Achievements',
      nextSteps: 'Recommended next steps',
      complete: 'complete',
      lessons: 'lessons',
      quizAvg: 'quiz avg',
      mins: 'mins',
      earned: 'Earned',
      locked: 'Locked',
      startPractice: 'Start practice',
      viewSubjects: 'View subjects',
    };

    return fallback;
  }, [language]);

  const loadProgress = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const savedProfile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
      const grade = savedProfile?.grade ? Number(savedProfile.grade) : 6;

      let studentId: number | null = null;
      let completedTopics = new Set<string>();
      let quizResultsList: { topic_id: string; score: number; total: number }[] = [];
      let sessionsList: { subject: string; duration_seconds: number; ended_at: string; mode: string }[] = [];
      let earnedBadges = new Set<string>();

      if (isLocalDatabaseAvailable()) {
        try {
          const db = getDb();
          const student = await db.getFirstAsync<{ id: number }>('SELECT id FROM students LIMIT 1');
          if (student) {
            studentId = student.id;
            
            // 1. Get completed topic IDs
            const completedRows = await db.getAllAsync<{ topic_id: string }>(
              `SELECT DISTINCT topic_id FROM sessions WHERE student_id = ? AND ended_at IS NOT NULL
               UNION
               SELECT DISTINCT topic_id FROM quiz_results WHERE student_id = ?`,
              [student.id, student.id]
            );
            completedTopics = new Set(completedRows.map(r => r.topic_id));

            // 2. Get quiz results
            quizResultsList = await db.getAllAsync<{ topic_id: string; score: number; total: number }>(
              `SELECT topic_id, score, total FROM quiz_results WHERE student_id = ?`,
              [student.id]
            );

            // 3. Get sessions
            sessionsList = await db.getAllAsync<{ subject: string; duration_seconds: number; ended_at: string; mode: string }>(
              `SELECT subject, duration_seconds, ended_at, mode FROM sessions WHERE student_id = ?`,
              [student.id]
            );

            // 4. Get earned achievements
            const achievementRows = await db.getAllAsync<{ badge_key: string }>(
              `SELECT badge_key FROM achievements WHERE student_id = ?`,
              [student.id]
            );
            earnedBadges = new Set(achievementRows.map(r => r.badge_key));
          }
        } catch (dbErr) {
          console.error('Error fetching progress from SQLite:', dbErr);
        }
      }

      // Map dynamic subjects
      const updatedSubjects: SubjectProgress[] = SUBJECTS_METADATA.map(sub => {
        const allTopics = TOPICS_BY_SUBJECT[sub.id] || [];
        const gradeTopics = allTopics.filter(t => {
          const id = t.id.toLowerCase();
          if (id.includes('grade6') || id.includes('grade7') || id.includes('grade8')) {
            return id.includes(`grade${grade}`);
          }
          return true;
        });

        const lessonsTotal = gradeTopics.length;
        const lessonsCompleted = gradeTopics.filter(t => completedTopics.has(t.id)).length;
        const masteryPercent = lessonsTotal > 0 ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0;

        // Quiz stats for this subject's topics
        const subjectTopicIds = new Set(gradeTopics.map(t => t.id));
        const subQuizzes = quizResultsList.filter(q => subjectTopicIds.has(q.topic_id));
        const totalScore = subQuizzes.reduce((sum, q) => sum + q.score, 0);
        const totalPossible = subQuizzes.reduce((sum, q) => sum + q.total, 0);
        const quizAverage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

        // Study time (duration in minutes)
        const subSessions = sessionsList.filter(s => s.subject === sub.id);
        const totalSeconds = subSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        const minutes = Math.round(totalSeconds / 60);

        // Last practiced
        const lastSession = subSessions
          .filter(s => s.ended_at)
          .sort((a, b) => new Date(b.ended_at).getTime() - new Date(a.ended_at).getTime())[0];
        
        let lastPracticed = 'Never';
        if (lastSession) {
          const diffMs = Date.now() - new Date(lastSession.ended_at).getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays <= 0) lastPracticed = 'Today';
          else if (diffDays === 1) lastPracticed = 'Yesterday';
          else if (diffDays < 7) lastPracticed = `${diffDays} days ago`;
          else lastPracticed = 'This week';
        }

        return {
          id: sub.id,
          name: sub.name,
          module: sub.module,
          iconName: sub.iconName,
          lessonsCompleted,
          lessonsTotal,
          masteryPercent,
          quizAverage,
          minutes,
          lastPracticed,
        };
      }).filter(s => s.lessonsTotal > 0);

      // Map dynamic achievements
      const updatedAchievements = ACHIEVEMENT_CATALOG.map(badge => {
        const unlocked = earnedBadges.has(badge.key);
        let isUnlocked = unlocked;
        let progress = unlocked ? 1 : 0;
        
        if (badge.key === 'first_steps') {
          const hasLesson = sessionsList.some(s => s.mode === 'lesson' && s.ended_at);
          if (hasLesson) {
            isUnlocked = true;
            progress = 1;
          }
        } else if (badge.key === 'quiz_whiz') {
          const hasPerfectQuiz = quizResultsList.some(q => q.score === q.total && q.total > 0);
          if (hasPerfectQuiz) {
            isUnlocked = true;
            progress = 1;
          }
        } else if (badge.key === 'steady_streak') {
          progress = 0;
        } else if (badge.key === 'deep_focus') {
          const totalMins = updatedSubjects.reduce((sum, s) => sum + s.minutes, 0);
          progress = Math.min(1, totalMins / 120);
          if (progress >= 1) {
            isUnlocked = true;
          }
        }

        return {
          ...badge,
          unlocked: isUnlocked,
          progress,
        };
      });

      setSubjects(updatedSubjects);
      setAchievements(updatedAchievements);
      setSyncMessage('Showing saved progress');
    } catch (error) {
      console.error(error);
      setSyncMessage('Error loading progress');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const totalLessons = subjects.reduce((sum, subject) => sum + subject.lessonsTotal, 0);
  const completedLessons = subjects.reduce((sum, subject) => sum + subject.lessonsCompleted, 0);
  const totalMinutes = subjects.reduce((sum, subject) => sum + subject.minutes, 0);
  const overallProgress = totalLessons > 0 ? clampPercent((completedLessons / totalLessons) * 100) : 0;
  const averageQuiz = subjects.length
    ? clampPercent(subjects.reduce((sum, subject) => sum + subject.quizAverage, 0) / subjects.length)
    : 0;
  const unlockedCount = achievements.filter((badge) => badge.unlocked).length;
  const weeklyTotal = WEEKLY_ACTIVITY.reduce((sum, item) => sum + item.minutes, 0);
  const strongestSubject = subjects.reduce((best, subject) =>
    subject.masteryPercent > best.masteryPercent ? subject : best,
  subjects[0]);
  const focusSubject = subjects.reduce((lowest, subject) =>
    subject.masteryPercent < lowest.masteryPercent ? subject : lowest,
  subjects[0]);

  const getSubjectColor = (module: string) => {
    switch (module) {
      case 'math':
        return colors.subjectMath;
      case 'science':
        return colors.subjectScience;
      case 'english':
        return colors.subjectEnglish;
      case 'coding':
        return colors.subjectCoding;
      case 'social':
        return colors.subjectSocial;
      case 'kannada':
        return colors.subjectKannada;
      default:
        return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer
        title={copy.title}
        subtitle={copy.subtitle}
        showBackButton={true}
        scrollable={false}
      >
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodyLg" color={colors.textSecondary} style={styles.loadingText}>
            Loading progress...
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title={copy.title}
      subtitle={copy.subtitle}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={{ gap: spacing.space5 }}
    >
      <Card style={[styles.heroCard, { backgroundColor: colors.surfaceBright }]}>
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <AppText variant="caption" color={colors.textSecondary} style={styles.overline}>
              {syncMessage.toUpperCase()}
            </AppText>
            <AppText variant="display" color={colors.primary} style={styles.heroPercent}>
              {overallProgress}%
            </AppText>
            <AppText variant="bodyLg" color={colors.textPrimary} style={styles.heroTitle}>
              Overall syllabus progress
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {completedLessons} of {totalLessons} lessons complete. Best momentum: {strongestSubject.name}.
            </AppText>
          </View>

          <View style={[styles.scoreBadge, { backgroundColor: colors.primarySubtle }]}>
            {React.createElement(getIcon('Trophy'), {
              size: 28,
              color: colors.primary,
              strokeWidth: 2.4,
            })}
            <AppText variant="caption" color={colors.primary} style={styles.scoreBadgeText}>
              Level 4
            </AppText>
          </View>
        </View>

        <ProgressBar progress={overallProgress / 100} height={12} color={colors.primary} />

        <View style={styles.heroActions}>
          <Button
            title={copy.continueLearning}
            onPress={() => router.push('/(home)')}
            icon={React.createElement(getIcon('PlayCircle'), {
              size: 18,
              color: colors.textOnPrimary,
            })}
            style={styles.heroButton}
          />
          <Button
            title={copy.refresh}
            variant="secondary"
            loading={isRefreshing}
            onPress={() => loadProgress(true)}
            icon={React.createElement(getIcon('RefreshCw'), {
              size: 18,
              color: colors.primary,
            })}
            style={styles.heroButton}
          />
        </View>
      </Card>

      <SectionHeader title={copy.quickStats} />
      <View style={styles.metricGrid}>
        <MetricCard
          iconName="Clock"
          label="Learning time"
          value={`${totalMinutes}`}
          detail={copy.mins}
          color={colors.subjectEnglish}
        />
        <MetricCard
          iconName="CheckCircle2"
          label="Lessons done"
          value={`${completedLessons}`}
          detail={`of ${totalLessons}`}
          color={colors.success}
        />
        <MetricCard
          iconName="Target"
          label="Quiz average"
          value={`${averageQuiz}%`}
          detail={copy.quizAvg}
          color={colors.subjectScience}
        />
        <MetricCard
          iconName="Award"
          label="Badges"
          value={`${unlockedCount}`}
          detail={`of ${achievements.length}`}
          color={colors.warning}
        />
      </View>

      <SectionHeader title={copy.weeklyActivity} />
      <Card style={styles.weeklyCard}>
        <View style={styles.weeklyHeader}>
          <View>
            <AppText variant="heading2" style={styles.cardHeading}>
              {weeklyTotal} minutes this week
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Keep the rhythm steady with one short session today.
            </AppText>
          </View>
          <View style={[styles.smallIconBubble, { backgroundColor: colors.successSubtle }]}>
            {React.createElement(getIcon('CalendarCheck'), {
              size: 22,
              color: colors.success,
            })}
          </View>
        </View>
        <View style={styles.barChart}>
          {WEEKLY_ACTIVITY.map((item) => {
            const height = 28 + (item.minutes / 40) * 72;
            const isPeak = item.minutes === Math.max(...WEEKLY_ACTIVITY.map((day) => day.minutes));

            return (
              <View key={item.day} style={styles.barItem}>
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height,
                        backgroundColor: isPeak ? colors.primary : colors.subjectCoding,
                      },
                    ]}
                  />
                </View>
                <AppText variant="caption" color={colors.textSecondary} style={styles.barLabel}>
                  {item.day}
                </AppText>
              </View>
            );
          })}
        </View>
      </Card>

      <SectionHeader title={copy.subjectMastery} />
      <View style={styles.subjectList}>
        {subjects.map((subject) => (
          <SubjectProgressRow
            key={subject.id}
            subject={subject}
            color={getSubjectColor(subject.module)}
            onPress={() =>
              router.push({
                pathname: '/(home)/subject/[id]',
                params: { id: subject.id, name: subject.name },
              })
            }
          />
        ))}
      </View>

      <SectionHeader title={copy.quizPerformance} />
      <Card style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <View>
            <AppText variant="heading2" style={styles.cardHeading}>
              {averageQuiz}% average score
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Next focus: {focusSubject.name}. A 10 minute review can lift this quickly.
            </AppText>
          </View>
          <View style={[styles.smallIconBubble, { backgroundColor: colors.primarySubtle }]}>
            {React.createElement(getIcon('Brain'), {
              size: 22,
              color: colors.primary,
            })}
          </View>
        </View>

        <View style={styles.quizRows}>
          {subjects.map((subject) => (
            <View key={subject.id} style={styles.quizRow}>
              <View style={styles.quizNameRow}>
                <View style={[styles.subjectDot, { backgroundColor: getSubjectColor(subject.module) }]} />
                <AppText variant="body" style={styles.quizName}>
                  {subject.name}
                </AppText>
              </View>
              <View style={styles.quizProgress}>
                <ProgressBar
                  progress={subject.quizAverage / 100}
                  height={7}
                  color={getSubjectColor(subject.module)}
                />
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={styles.quizScore}>
                {subject.quizAverage}%
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title={copy.achievements} />
      <View style={styles.achievementList}>
        {achievements.map((badge) => (
          <AchievementRow key={badge.key} badge={badge} />
        ))}
      </View>

      <SectionHeader title={copy.nextSteps} />
      <View style={styles.nextSteps}>
        <NextStepCard
          iconName="Target"
          title={`Practice ${focusSubject.name}`}
          description={`Review the lowest mastery area and try one quiz. Current mastery: ${focusSubject.masteryPercent}%.`}
          buttonLabel={copy.startPractice}
          color={getSubjectColor(focusSubject.module)}
          onPress={() =>
            router.push({
              pathname: '/(home)/subject/[id]',
              params: { id: focusSubject.id, name: focusSubject.name },
            })
          }
        />
        <NextStepCard
          iconName="BookOpen"
          title="Open subject map"
          description="Choose a fresh lesson or continue the topic that is already in motion."
          buttonLabel={copy.viewSubjects}
          color={colors.primary}
          onPress={() => router.push('/(home)')}
        />
      </View>
    </ScreenContainer>
  );
}

interface MetricCardProps {
  iconName: IconName;
  label: string;
  value: string;
  detail: string;
  color: string;
}

function MetricCard({ iconName, label, value, detail, color }: MetricCardProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
        {React.createElement(getIcon(iconName), {
          size: 20,
          color,
          strokeWidth: 2.4,
        })}
      </View>
      <AppText variant="display" color={color} style={styles.metricValue}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} style={styles.metricLabel}>
        {label}
      </AppText>
      <AppText variant="caption" color={colors.textDisabled} style={styles.metricDetail}>
        {detail}
      </AppText>
    </Card>
  );
}

interface SubjectProgressRowProps {
  subject: SubjectProgress;
  color: string;
  onPress: () => void;
}

function SubjectProgressRow({ subject, color, onPress }: SubjectProgressRowProps) {
  const { colors } = useTheme();

  return (
    <Card onPress={onPress} style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <View style={[styles.subjectIcon, { backgroundColor: `${color}18` }]}>
          {React.createElement(getIcon(subject.iconName), {
            size: 22,
            color,
            strokeWidth: 2.4,
          })}
        </View>
        <View style={styles.subjectTitleBlock}>
          <AppText variant="heading2" style={styles.subjectName}>
            {subject.name}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Last practiced: {subject.lastPracticed}
          </AppText>
        </View>
        <AppText variant="heading2" color={color} style={styles.subjectPercent}>
          {subject.masteryPercent}%
        </AppText>
      </View>

      <ProgressBar progress={subject.masteryPercent / 100} color={color} height={8} />

      <View style={styles.subjectMeta}>
        <AppText variant="caption" color={colors.textSecondary}>
          {subject.lessonsCompleted}/{subject.lessonsTotal} lessons
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {subject.minutes} mins
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {subject.quizAverage}% quiz avg
        </AppText>
      </View>
    </Card>
  );
}

interface AchievementRowProps {
  badge: AchievementItem;
}

function AchievementRow({ badge }: AchievementRowProps) {
  const { colors } = useTheme();
  const badgeColor = badge.unlocked ? colors.warning : colors.textDisabled;

  return (
    <Card style={[styles.badgeCard, !badge.unlocked && styles.lockedBadge]}>
      <View style={[styles.badgeIcon, { backgroundColor: badge.unlocked ? colors.warningSubtle : colors.surfaceAlt }]}>
        {React.createElement(getIcon(badge.unlocked ? badge.iconName : 'Lock'), {
          size: 22,
          color: badgeColor,
          strokeWidth: 2.4,
        })}
      </View>
      <View style={styles.badgeBody}>
        <View style={styles.badgeTitleRow}>
          <AppText variant="heading2" style={styles.badgeTitle}>
            {badge.name}
          </AppText>
          <AppText variant="caption" color={badge.unlocked ? colors.success : colors.textDisabled} style={styles.badgeStatus}>
            {badge.unlocked ? 'Unlocked' : 'Locked'}
          </AppText>
        </View>
        <AppText variant="body" color={colors.textSecondary}>
          {badge.description}
        </AppText>
        <View style={styles.badgeProgressRow}>
          <View style={styles.badgeProgressBar}>
            <ProgressBar
              progress={badge.progress}
              height={6}
              color={badge.unlocked ? colors.warning : colors.textDisabled}
            />
          </View>
          <AppText variant="caption" color={colors.textSecondary} style={styles.badgeProgressText}>
            {Math.round(badge.progress * 100)}%
          </AppText>
        </View>
        {badge.unlocked && badge.earnedAt && (
          <AppText variant="caption" color={colors.success} style={styles.earnedText}>
            Earned: {badge.earnedAt}
          </AppText>
        )}
      </View>
    </Card>
  );
}

interface NextStepCardProps {
  iconName: IconName;
  title: string;
  description: string;
  buttonLabel: string;
  color: string;
  onPress: () => void;
}

function NextStepCard({ iconName, title, description, buttonLabel, color, onPress }: NextStepCardProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.nextStepCard}>
      <View style={styles.nextStepHeader}>
        <View style={[styles.nextStepIcon, { backgroundColor: `${color}18` }]}>
          {React.createElement(getIcon(iconName), {
            size: 22,
            color,
            strokeWidth: 2.4,
          })}
        </View>
        <View style={styles.nextStepCopy}>
          <AppText variant="heading2" style={styles.nextStepTitle}>
            {title}
          </AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {description}
          </AppText>
        </View>
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.inlineAction,
          { backgroundColor: `${color}18` },
          pressed && { opacity: 0.75 },
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
      >
        <AppText variant="button" color={color} style={styles.inlineActionText}>
          {buttonLabel}
        </AppText>
        {React.createElement(getIcon('ArrowRight'), {
          size: 18,
          color,
        })}
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontWeight: '600',
  },
  heroCard: {
    gap: 18,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  overline: {
    fontWeight: '800',
    letterSpacing: 0,
  },
  heroPercent: {
    fontWeight: '800',
    lineHeight: 56,
  },
  heroTitle: {
    fontWeight: '800',
  },
  scoreBadge: {
    width: 74,
    minHeight: 74,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  scoreBadgeText: {
    fontWeight: '800',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroButton: {
    flex: 1,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    minHeight: 154,
    gap: 6,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontWeight: '800',
  },
  metricLabel: {
    fontWeight: '800',
  },
  metricDetail: {
    fontWeight: '700',
  },
  weeklyCard: {
    gap: 18,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardHeading: {
    fontWeight: '800',
    marginBottom: 4,
  },
  smallIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barChart: {
    height: 132,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    width: '100%',
    height: 108,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontWeight: '800',
  },
  subjectList: {
    gap: 12,
  },
  subjectCard: {
    gap: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitleBlock: {
    flex: 1,
  },
  subjectName: {
    fontWeight: '800',
  },
  subjectPercent: {
    fontWeight: '800',
    minWidth: 54,
    textAlign: 'right',
  },
  subjectMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quizCard: {
    gap: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  quizRows: {
    gap: 12,
  },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 28,
  },
  quizNameRow: {
    width: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quizName: {
    fontWeight: '700',
  },
  quizProgress: {
    flex: 1,
  },
  quizScore: {
    minWidth: 42,
    textAlign: 'right',
    fontWeight: '800',
  },
  achievementList: {
    gap: 12,
  },
  badgeCard: {
    flexDirection: 'row',
    gap: 14,
  },
  lockedBadge: {
    opacity: 0.72,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBody: {
    flex: 1,
    gap: 6,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  badgeTitle: {
    fontWeight: '800',
  },
  badgeStatus: {
    fontWeight: '800',
  },
  badgeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeProgressBar: {
    flex: 1,
  },
  badgeProgressText: {
    width: 38,
    textAlign: 'right',
    fontWeight: '800',
  },
  earnedText: {
    fontWeight: '800',
  },
  nextSteps: {
    gap: 12,
    marginBottom: 10,
  },
  nextStepCard: {
    gap: 14,
  },
  nextStepHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  nextStepIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepCopy: {
    flex: 1,
  },
  nextStepTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  inlineAction: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  inlineActionText: {
    fontWeight: '800',
  },
});
