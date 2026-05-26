import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme, useSubjectColor } from '@/theme/theme';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ScreenContainer } from '../../../components/ScreenContainer';

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
};

export default function SubjectDetails(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const subjectId = id || 'math';
  const subjectName = 
    subjectId === 'math' ? 'Mathematics' :
    subjectId === 'science' ? 'Science' :
    subjectId === 'social' ? 'Social Studies' :
    subjectId === 'english' ? 'English' : 'Kannada';

  const subjectColor = useSubjectColor(subjectName);
  const topics = TOPICS_BY_SUBJECT[subjectId] || [];

  return (
    <ScreenContainer
      title={subjectName}
      subtitle={language === 'en' ? 'Select a topic to start learning' : language === 'hi' ? 'सीखने के लिए एक विषय चुनें' : 'ಕಲಿಯಲು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
      showBackButton={true}
      scrollable={true}
    >
      <View style={styles.list}>
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
                  variant="primary"
                  title={language === 'en' ? 'Read' : language === 'hi' ? 'पढ़ें' : 'ಓದಿ'}
                  onPress={() => router.push({
                    pathname: '/(home)/lesson/[topicId]',
                    params: { topicId: topic.id }
                  })}
                  style={[styles.actionBtn, { backgroundColor: subjectColor }]}
                />
                
                <Button
                  variant="secondary"
                  title={language === 'en' ? 'Quiz' : language === 'hi' ? 'क्विज़' : 'ರಸಪ್ರಶ್ನೆ'}
                  onPress={() => router.push({
                    pathname: '/(home)/quiz/[topicId]',
                    params: { topicId: topic.id }
                  })}
                  style={[styles.actionBtn, { borderColor: subjectColor }]}
                />

                <Button
                  variant="ghost"
                  title={language === 'en' ? 'Cards' : language === 'hi' ? 'कार्ड' : 'ಕಾರ್ಡ್ಸ್'}
                  onPress={() => router.push({
                    pathname: '/(home)/flashcards/[topicId]',
                    params: { topicId: topic.id }
                  })}
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
    gap: 20,
    marginTop: 10,
  },
  topicCard: {
    borderLeftWidth: 6,
    paddingLeft: 14,
  },
  cardHeader: {
    marginBottom: 6,
  },
  topicTitle: {
    fontWeight: '700',
  },
  topicDesc: {
    marginBottom: 16,
    lineHeight: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    minHeight: 40,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
