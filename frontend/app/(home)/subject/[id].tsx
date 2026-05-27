import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Code2 } from 'lucide-react-native';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme, useSubjectColor } from '@/theme/theme';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { apiFetch } from '@/services/api';
import { TOPICS_BY_SUBJECT as SUBJECT_TOPIC_BANK } from '@/content/learningContent';

interface TopicItem {
  id: string;
  title: { en: string; hi: string; kn: string };
  desc: { en: string; hi: string; kn: string };
}

const TOPICS_BY_SUBJECT: Record<string, TopicItem[]> = {
  math: [
    { id: 'fractions', title: { en: 'Fractions & Decimals', hi: 'भिन्न और दशमलव', kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ದಶಮಾಂಶಗಳು' }, desc: { en: 'Understand parts of a whole and basic divisions.', hi: 'एक पूरे के हिस्सों और बुनियादी विभाजनों को समझें।', kn: 'ಒಂದಿಡೀ ಭಾಗಗಳು ಮತ್ತು ಮೂಲಭೂತ ಭಾಗಾಕಾರಗಳನ್ನು ತಿಳಿಯಿರಿ.' } },
    { id: 'algebra', title: { en: 'Introduction to Algebra', hi: 'बीजगणित का परिचय', kn: 'ಬೀಜಗಣಿತದ ಪರಿಚಯ' }, desc: { en: 'Learn how variables replace numbers in equations.', hi: 'सीखें कि समीकरणों में चर संख्याओं का स्थान कैसे लेते हैं।', kn: 'ಸಮೀಕರಣಗಳಲ್ಲಿ ಚರಾಂಶಗಳು ಸಂಖ್ಯೆಗಳನ್ನು ಹೇಗೆ ಬದಲಾಯಿಸುತ್ತವೆ ಎಂಬುದನ್ನು ಕಲಿಯಿರಿ.' } },
  ],
  science: [
    { id: 'forces', title: { en: 'Force & Motion', hi: 'बल और गति', kn: 'ಬಲ ಮತ್ತು ಚಲನೆ' }, desc: { en: 'Explore Newton laws, friction, and gravity.', hi: 'न्यूटन के नियमों, घर्षण और गुरुत्वाकर्षण का पता लगाएं।', kn: 'ನ್ಯೂಟನ್ ನಿಯಮಗಳು, ಘರ್ಷಣೆ ಮತ್ತು ಗುರುತ್ವಾಕರ್ಷಣೆಯನ್ನು ಅನ್ವೇಷಿಸಿ.' } },
    { id: 'plants', title: { en: 'Photosynthesis', hi: 'प्रकाश संश्लेषण', kn: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ' }, desc: { en: 'How green plants turn sunlight into energy.', hi: 'हरे पौधे सूर्य के प्रकाश को ऊर्जा में कैसे बदलते हैं।', kn: 'ಹಸಿರು ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕನ್ನು ಶಕ್ತಿಯನ್ನಾಗಿ ಹೇಗೆ ಪರಿವರ್ತಿಸುತ್ತವೆ.' } },
  ],
  social: [
    { id: 'indus', title: { en: 'Indus Valley Civilization', hi: 'सिंधु घाटी सभ्यता', kn: 'ಸಿಂಧೂ ಕಣಿವೆ ನಾಗರಿಕತೆ' }, desc: { en: 'Discover the ancient cities of Harappa and Mohenjo-daro.', hi: 'हड़प्पा और मोहनजोदड़ो के प्राचीन शहरों की खोज करें।', kn: 'ಹರಪ್ಪ ಮತ್ತು ಮೊಹೆಂಜೊ-ದಾರೋ ಪುರಾತನ ನಗರಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.' } },
  ],
  english: [
    { id: 'tenses', title: { en: 'Active & Passive Voice', hi: 'सक्रिय और निष्क्रिय आवाज', kn: 'ಕರ್ತರಿ ಮತ್ತು ಕರ್ಮಣಿ ಪ್ರಯೋಗ' }, desc: { en: 'Master subject-verb emphasis in sentences.', hi: 'वाक्यों में कर्ता-क्रिया के महत्व में महारत हासिल करें।', kn: 'ವಾಕ್ಯಗಳಲ್ಲಿ ಕರ್ತೃ-ಕ್ರಿಯಾಪದದ ಒತ್ತು ನೀಡುವುದನ್ನು ಕಲಿಯಿರಿ.' } },
  ],
  kannada: [
    { id: 'sandhi', title: { en: 'Kannada Sandhigalu', hi: 'कन्नड़ संधि', kn: 'ಕನ್ನಡ ಸಂಧಿಗಳು' }, desc: { en: 'Understand joint word formations in grammar.', hi: 'व्याकरण में संयुक्त शब्द रूपों को समझें।', kn: 'ಕನ್ನಡ ವ್ಯಾಕರಣದಲ್ಲಿ ಸಂಧಿ ಪದಗಳ ರಚನೆಯನ್ನು ತಿಳಿಯಿರಿ.' } },
  ],
  coding: [
    { id: 'coding-basics', title: { en: 'Coding Basics', hi: 'Coding Basics', kn: 'Coding Basics' }, desc: { en: 'Learn commands, sequences, and how programs follow instructions.', hi: 'Learn commands, sequences, and how programs follow instructions.', kn: 'Learn commands, sequences, and how programs follow instructions.' } },
    { id: 'logic-loops', title: { en: 'Logic & Loops', hi: 'Logic & Loops', kn: 'Logic & Loops' }, desc: { en: 'Use conditions and repeated steps to solve small problems.', hi: 'Use conditions and repeated steps to solve small problems.', kn: 'Use conditions and repeated steps to solve small problems.' } },
    { id: 'build-an-app', title: { en: 'Build a Mini App', hi: 'Build a Mini App', kn: 'Build a Mini App' }, desc: { en: 'Plan screens, buttons, and simple interactions for an app idea.', hi: 'Plan screens, buttons, and simple interactions for an app idea.', kn: 'Plan screens, buttons, and simple interactions for an app idea.' } },
  ],
};

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
  const [topics, setTopics] = useState<TopicItem[]>(SUBJECT_TOPIC_BANK[subjectId] || []);

  useEffect(() => {
    let active = true;

    async function loadBackendTopics() {
      if (SUBJECT_TOPIC_BANK[subjectId]) {
        setTopics(SUBJECT_TOPIC_BANK[subjectId]);
        return;
      }

      try {
        const response = await apiFetch(`/api/v1/subjects/${subjectId}/topics`);
        if (!response.ok) return;

        const res = await response.json();
        if (!active || !res?.success || !Array.isArray(res.data)) return;

        const mappedTopics = res.data.map((topic: any) => {
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

        setTopics(mappedTopics);
      } catch (error) {
        console.log('[Subject Integration] Backend topics unavailable, using local fallback.', error);
      }
    }

    loadBackendTopics();

    return () => {
      active = false;
    };
  }, [subjectId]);

  return (
    <ScreenContainer
      title={subjectName}
      subtitle={language === 'en' ? 'Select a topic to start learning' : language === 'hi' ? 'सीखने के लिए एक विषय चुनें' : 'ಕಲಿಯಲು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
      showBackButton={true}
      scrollable={true}
    >
      <View style={styles.list}>
        {isCodingSubject && (
          <Card style={[styles.sandboxCard, { borderColor: subjectColor }]}>
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
              style={[styles.sandboxButton, { borderColor: subjectColor }]}
            />
          </Card>
        )}

        {topics.map((topic) => {
          const titleText = topic.title[language] || topic.title.en;
          const descText = topic.desc[language] || topic.desc.en;

          return (
            <Card key={topic.id} style={[styles.topicCard, { borderLeftColor: subjectColor }]}>
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
                  style={[styles.actionBtn, { borderColor: subjectColor }]}
                />
                
                <Button
                  variant="secondary"
                  title={language === 'en' ? 'Quiz' : language === 'hi' ? 'क्विज़' : 'ರಸಪ್ರಶ್ನೆ'}
                  onPress={() => router.push({
                    pathname: '/(home)/quiz/[topicId]',
                    params: { topicId: topic.id }
                  })}
                  textColor={colors.primary}
                  style={[styles.actionBtn, { borderColor: subjectColor }]}
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
    borderLeftWidth: 6,
    paddingLeft: 16,
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
    borderWidth: 1.5,
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
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
