import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Code2 } from 'lucide-react-native';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme, useSubjectColor } from '@/theme/theme';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { apiFetch } from '@/services/api';
import { TOPICS_BY_SUBJECT as SUBJECT_TOPIC_BANK } from '@/content/learningContent';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject } from '@/utils/storage';

interface TopicItem {
  id: string;
  title: { en: string; hi: string; kn: string };
  desc: { en: string; hi: string; kn: string };
}

export default function SubjectDetails(): React.JSX.Element {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const subjectId = id || 'math';
  const fallbackSubjectName =
    subjectId === 'math' ? 'Mathematics' :
    subjectId === 'science' ? 'Science' :
    subjectId === 'social' ? 'Social Studies' :
    subjectId === 'english' ? 'English' :
    subjectId === 'coding' ? 'Coding' : 'Kannada';
  const subjectName = name || fallbackSubjectName;

  const subjectColor = useSubjectColor(subjectName);
  const isCodingSubject = /coding|code|program/.test(`${subjectId} ${subjectName}`.toLowerCase());
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [grade, setGrade] = useState<number>(6);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadTopicsAndProfile() {
        try {
          const profile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
          const studentGrade = profile?.grade ? Number(profile.grade) : 6;
          if (!active) return;
          setGrade(studentGrade);

          let finalTopics = SUBJECT_TOPIC_BANK[subjectId] || [];

          if (finalTopics.length === 0) {
            try {
              const response = await apiFetch(`/api/v1/subjects/${subjectId}/topics`);
              if (response.ok) {
                const res = await response.json();
                if (active && res?.success && Array.isArray(res.data)) {
                  finalTopics = res.data.map((topic: any) => {
                    const title = topic.name || 'Topic';
                    const description = topic.metadata?.description || `Learn about ${title}.`;

                    return {
                      id: topic._id,
                      title: typeof title === 'string' ? { en: title, hi: title, kn: title } : title,
                      desc: typeof description === 'string'
                        ? { en: description, hi: description, kn: description }
                        : description,
                    };
                  });
                }
              }
            } catch (error) {
              console.log('[Subject Integration] Backend topics unavailable.', error);
            }
          }

          const filtered = finalTopics.filter(topic => {
            const topicIdLower = topic.id.toLowerCase();
            if (topicIdLower.includes('grade6') || topicIdLower.includes('grade7') || topicIdLower.includes('grade8')) {
              return topicIdLower.includes(`grade${studentGrade}`);
            }
            return true;
          });

          setTopics(filtered);
        } catch (err) {
          console.error(err);
        }
      }

      loadTopicsAndProfile();

      return () => {
        active = false;
      };
    }, [subjectId])
  );

  return (
    <ScreenContainer
      title={subjectName}
      subtitle={language === 'en' ? 'Select a topic to start learning' : language === 'hi' ? 'सीखने के लिए एक विषय चुनें' : 'ಕಲಿಯಲು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
      showBackButton={true}
      scrollable={true}
    >
      <View style={styles.list}>
        {isCodingSubject && (
          <Card style={[styles.sandboxCard, { backgroundColor: `${subjectColor}12` }]}>
            <View style={styles.sandboxHeader}>
              <View style={[styles.sandboxIcon, { backgroundColor: `${subjectColor}20` }]}>
                <Code2 size={24} color={subjectColor} />
              </View>
              <View style={styles.sandboxCopy}>
                <AppText variant="heading2" style={styles.topicTitle}>
                  Coding Sandbox
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.topicDesc}>
                  Write JavaScript, run it, and check small challenges.
                </AppText>
              </View>
            </View>
            <Button
              variant="secondary"
              title="Open Sandbox"
              onPress={() => router.push('/(home)/coding-sandbox')}
              icon={<Code2 size={18} color={subjectColor} />}
              textColor={subjectColor}
              style={styles.sandboxButton}
            />
          </Card>
        )}

        {topics.map((topic) => {
          const titleText = topic.title[language] || topic.title.en;
          const descText = topic.desc[language] || topic.desc.en;

          return (
            <Card key={topic.id} style={[styles.topicCard, { backgroundColor: `${subjectColor}12` }]}>
              <View style={styles.cardHeader}>
                <AppText variant="heading2" style={styles.topicTitle}>
                  {titleText}
                </AppText>
              </View>
              <AppText variant="body" color={colors.textSecondary} style={styles.topicDesc}>
                {descText}
              </AppText>

              {/* Action grid for this topic */}
              <View style={styles.actionGrid}>
                <Button
                  variant="secondary"
                  title={language === 'en' ? 'Read' : language === 'hi' ? 'पढ़ें' : 'ಓದಿ'}
                  onPress={() => router.push({
                    pathname: '/(home)/lesson/[topicId]',
                    params: { topicId: topic.id }
                  })}
                  textColor={subjectColor}
                  style={styles.actionBtn}
                />
                
                <Button
                  variant="secondary"
                  title={language === 'en' ? 'Quiz' : language === 'hi' ? 'क्विज़' : 'ರಸಪ್ರಶ್ನೆ'}
                  onPress={() => router.push({
                    pathname: '/(home)/quiz/[topicId]',
                    params: { topicId: topic.id }
                  })}
                  textColor={colors.primary}
                  style={styles.actionBtn}
                />

                <Button
                  variant="ghost"
                  title={language === 'en' ? 'Cards' : language === 'hi' ? 'कार्ड' : 'ಕಾರ್ಡ್ಸ್'}
                  onPress={() => router.push({
                    pathname: '/(home)/flashcards/[topicId]',
                    params: { topicId: topic.id }
                  })}
                  textColor={colors.textPrimary}
                  style={styles.actionBtn}
                />
              </View>
            </Card>
          );
        })}

        {topics.length === 0 && (
          <Card style={styles.emptyCard}>
            <AppText variant="bodyLg" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              {language === 'en' ? 'No topics available for this grade.' : language === 'hi' ? 'इस कक्षा के लिए कोई विषय उपलब्ध नहीं है।' : 'ಈ ತರಗತಿಗೆ ಯಾವುದೇ ವಿಷಯಗಳು ಲಭ್ಯವಿಲ್ಲ.'}
            </AppText>
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 18,
    marginTop: 12,
  },
  topicCard: {
    paddingLeft: 18,
  },
  cardHeader: {
    marginBottom: 6,
  },
  topicTitle: {
    fontWeight: '700',
  },
  topicDesc: {
    marginBottom: 18,
  },
  sandboxCard: {
    padding: 18,
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sandboxIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sandboxCopy: {
    flex: 1,
  },
  sandboxButton: {
    marginTop: 14,
    minHeight: 44,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    flexGrow: 1,
    flexBasis: 96,
    paddingHorizontal: 8,
    paddingVertical: 10,
    minHeight: 46,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
