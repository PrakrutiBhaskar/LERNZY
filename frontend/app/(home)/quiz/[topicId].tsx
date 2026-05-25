import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { QuizOption } from '../../components/QuizOption';
import { ScreenContainer } from '../../components/ScreenContainer';

interface QuestionData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUIZ_DATA: Record<string, QuestionData> = {
  fractions: {
    question: "If a pizza is cut into 8 equal slices and Rohan eats 3 slices, what fraction of the pizza is left?",
    options: [
      "3/8 of the pizza",
      "5/8 of the pizza",
      "1/2 of the pizza"
    ],
    correctIndex: 1,
    explanation: "Eating 3 out of 8 slices leaves 5 slices. So, 5/8 of the pizza is left."
  },
  forces: {
    question: "Which force pulls falling objects towards the center of the Earth?",
    options: [
      "Frictional Force",
      "Gravitational Force",
      "Magnetic Force"
    ],
    correctIndex: 1,
    explanation: "Gravity is the invisible force that pulls objects toward each other, keeping us on the ground and causing objects to fall."
  }
};

export default function QuizScreen(): React.JSX.Element {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();

  const quizKey = topicId || 'fractions';
  const defaultQuestion: QuestionData = {
    question: `What is the core definition of the concept of ${topicId}?`,
    options: ["Option A: This is a basic definition.", "Option B: This is the correct definition.", "Option C: This is an incorrect definition."],
    correctIndex: 1,
    explanation: "Option B is correct because it matches the core concepts of the syllabus."
  };

  const quiz = SAMPLE_QUIZ_DATA[quizKey] || defaultQuestion;

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    // Navigate back to subject details
    router.back();
  };

  return (
    <ScreenContainer
      title={language === 'en' ? 'Challenge Quiz' : language === 'hi' ? 'चुनौती प्रश्नोत्तरी' : 'ಸವಾಲಿನ ರಸಪ್ರಶ್ನೆ'}
      showBackButton={true}
      scrollable={true}
    >
      <View style={styles.container}>
        {/* Question Card */}
        <Card style={styles.questionCard}>
          <AppText variant="heading2" style={styles.questionText}>
            {quiz.question}
          </AppText>
        </Card>

        {/* Option List */}
        <View style={styles.optionsList}>
          {quiz.options.map((option, idx) => {
            let status: 'none' | 'correct' | 'incorrect' = 'none';
            if (submitted) {
              if (idx === quiz.correctIndex) {
                status = 'correct';
              } else if (idx === selectedIdx) {
                status = 'incorrect';
              }
            }

            return (
              <QuizOption
                key={idx}
                text={option}
                selected={selectedIdx === idx}
                status={status}
                disabled={submitted}
                onPress={() => setSelectedIdx(idx)}
                style={styles.optionItem}
              />
            );
          })}
        </View>

        {/* Explanation Card */}
        {submitted && (
          <Card style={styles.explanationCard}>
            <AppText variant="heading2" color={colors.success} style={styles.explTitle}>
              {selectedIdx === quiz.correctIndex
                ? (language === 'en' ? 'Correct!' : language === 'hi' ? 'सही उत्तर!' : 'ಸರಿಯಾದ ಉತ್ತರ!')
                : (language === 'en' ? 'Incorrect' : language === 'hi' ? 'गलत उत्तर' : 'ತಪ್ಪಾದ ಉತ್ತರ')}
            </AppText>
            <AppText variant="bodyLg" color={colors.textSecondary}>
              {quiz.explanation}
            </AppText>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!submitted ? (
            <Button
              title={language === 'en' ? 'Submit Answer' : language === 'hi' ? 'उत्तर जमा करें' : 'ಉತ್ತರ ಸಲ್ಲಿಸಿ'}
              disabled={selectedIdx === null}
              onPress={handleSubmit}
            />
          ) : (
            <Button
              title={language === 'en' ? 'Finish Topic' : language === 'hi' ? 'विषय समाप्त करें' : 'ವಿಷಯ ಪೂರ್ಣಗೊಳಿಸಿ'}
              onPress={handleNext}
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 10,
  },
  questionCard: {
    padding: 20,
  },
  questionText: {
    fontWeight: '700',
    lineHeight: 26,
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  explanationCard: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  explTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  actions: {
    marginTop: 10,
  },
});
