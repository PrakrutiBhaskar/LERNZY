import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { QuizOption } from '../../components/QuizOption';
import { ProgressBar } from '../../components/ProgressBar';
import { TutorBubble } from '../../components/TutorBubble';
import { ScreenContainer } from '../../components/ScreenContainer';

interface Question {
  id: string;
  question: { en: string; hi: string; kn: string };
  options: { en: string[]; hi: string[]; kn: string[] };
  correct_index: number;
  explanation: { en: string; hi: string; kn: string };
}

const MOCK_QUIZ_BANK: Record<string, Question[]> = {
  fractions: [
    {
      id: "q001",
      question: {
        en: "What is 1/2 + 1/4?",
        hi: "1/2 + 1/4 क्या है?",
        kn: "1/2 + 1/4 ಎಷ್ಟು?"
      },
      options: {
        en: ["2/6", "3/4", "2/4", "3/8"],
        hi: ["2/6", "3/4", "2/4", "3/8"],
        kn: ["2/6", "3/4", "2/4", "3/8"]
      },
      correct_index: 1,
      explanation: {
        en: "The LCM of 2 and 4 is 4. We rewrite 1/2 as 2/4. Then we add: 2/4 + 1/4 = 3/4.",
        hi: "2 और 4 का LCM 4 है। हम 1/2 को 2/4 के रूप में लिखते हैं। फिर जोड़ें: 2/4 + 1/4 = 3/4।",
        kn: "2 ಮತ್ತು 4 ರ ಲಸಾಅ 4 ಆಗಿದೆ. ನಾವು 1/2 ಅನ್ನು 2/4 ಎಂದು ಬರೆಯಬಹುದು. ನಂತರ ಕೂಡಿರಿ: 2/4 + 1/4 = 3/4."
      }
    },
    {
      id: "q002",
      question: {
        en: "What is 1/3 + 1/6?",
        hi: "1/3 + 1/6 क्या है?",
        kn: "1/3 + 1/6 ಎಷ್ಟು?"
      },
      options: {
        en: ["2/9", "3/6", "1/2", "2/6"],
        hi: ["2/9", "3/6", "1/2", "2/6"],
        kn: ["2/9", "3/6", "1/2", "2/6"]
      },
      correct_index: 2,
      explanation: {
        en: "The LCM of 3 and 6 is 6. Convert 1/3 to 2/6. Then 2/6 + 1/6 = 3/6, which simplifies to 1/2.",
        hi: "3 और 6 का LCM 6 है। 1/3 को 2/6 में बदलें। फिर 2/6 + 1/6 = 3/6, जो सरल होकर 1/2 हो जाता है।",
        kn: "3 ಮತ್ತು 6 ರ ಲಸಾಅ 6 ಆಗಿದೆ. 1/3 ಅನ್ನು 2/6 ಆಗಿ ಪರಿವರ್ತಿಸಿ. ನಂತರ 2/6 + 1/6 = 3/6, ಇದನ್ನು ಸುಲಭ ರೂಪಕ್ಕೆ ತಂದಾಗ 1/2 ಆಗುತ್ತದೆ."
      }
    },
    {
      id: "q003",
      question: {
        en: "What is 2/5 + 1/10?",
        hi: "2/5 + 1/10 क्या है?",
        kn: "2/5 + 1/10 ಎಷ್ಟು?"
      },
      options: {
        en: ["3/15", "1/2", "3/10", "4/10"],
        hi: ["3/15", "1/2", "3/10", "4/10"],
        kn: ["3/15", "1/2", "3/10", "4/10"]
      },
      correct_index: 1,
      explanation: {
        en: "The LCM of 5 and 10 is 10. Convert 2/5 to 4/10. Add: 4/10 + 1/10 = 5/10, which reduces to 1/2.",
        hi: "5 और 10 का LCM 10 है। 2/5 को 4/10 में बदलें। जोड़ें: 4/10 + 1/10 = 5/10, जो घटकर 1/2 हो जाता है।",
        kn: "5 ಮತ್ತು 10 ರ ಲಸಾಅ 10 ಆಗಿದೆ. 2/5 ಅನ್ನು 4/10 ಆಗಿ ಪರಿವರ್ತಿಸಿ. ಕೂಡಿರಿ: 4/10 + 1/10 = 5/10, ಇದನ್ನು ಸಣ್ಣದಾಗಿಸಿದಾಗ 1/2 ಆಗುತ್ತದೆ."
      }
    }
  ]
};

export default function QuizScreen(): React.JSX.Element {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const quizKey = topicId || 'fractions';
  const questions = MOCK_QUIZ_BANK[quizKey] || MOCK_QUIZ_BANK.fractions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const activeQuestion = questions[currentIdx];
  const totalQuestions = questions.length;

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    
    if (selectedIdx === activeQuestion.correct_index) {
      setScore((prev) => prev + 1);
    }
    setSubmitted(true);
  };

  const handleNext = () => {
    setSelectedIdx(null);
    setSubmitted(false);

    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleFinish = () => {
    router.replace('/(home)');
  };

  const getTutorMessage = () => {
    if (!submitted) {
      return language === 'en'
        ? "Look at the question carefully. You can do it!"
        : language === 'hi'
        ? "प्रश्न को ध्यान से देखें। आप इसे कर सकते हैं!"
        : "ಪ್ರಶ್ನೆಯನ್ನು ಗಮನವಿಟ್ಟು ನೋಡಿ. ನೀವು ಇದನ್ನು ಮಾಡಲು ಸಾಧ್ಯವಿದೆ!";
    }

    const isCorrect = selectedIdx === activeQuestion.correct_index;
    if (isCorrect) {
      return language === 'en'
        ? "Awesome! You got it right! 🌟"
        : language === 'hi'
        ? "बहुत बढ़िया! आपका उत्तर बिल्कुल सही है! 🌟"
        : "ಅದ್ಭುತ! ನಿಮ್ಮ ಉತ್ತರ ಸರಿಯಾಗಿದೆ! 🌟";
    } else {
      return language === 'en'
        ? "So close! Don't worry, let's look at the explanation below together. 💡"
        : language === 'hi'
        ? "बहुत पास थे! चिंता न करें, आइए मिलकर नीचे दिए गए स्पष्टीकरण को देखते हैं। 💡"
        : "ತುಂಬಾ ಹತ್ತಿರ ಬಂದಿದ್ದಿರಿ! ಚಿಂತಿಸಬೇಡಿ, ಕೆಳಗಿನ ವಿವರಣೆಯನ್ನು ಒಟ್ಟಿಗೆ ನೋಡೋಣ. 💡";
    }
  };

  if (quizCompleted) {
    const passed = score >= totalQuestions / 2;
    return (
      <ScreenContainer
        title={language === 'en' ? 'Quiz Completed' : language === 'hi' ? 'प्रश्नोत्तरी समाप्त' : 'ರಸಪ್ರಶ್ನೆ ಪೂರ್ಣಗೊಂಡಿದೆ'}
        showBackButton={false}
        scrollable={true}
        contentContainerStyle={styles.completeContainer}
      >
        <Card style={styles.summaryCard}>
          <AppText variant="display" style={styles.trophy}>
            {passed ? '🏆' : '🌱'}
          </AppText>
          <AppText variant="heading1" style={styles.summaryTitle} color={colors.primary}>
            {passed 
              ? (language === 'en' ? 'Super Job!' : language === 'hi' ? 'बहुत बढ़िया काम!' : 'ಅತ್ಯುತ್ತಮ ಕೆಲಸ!')
              : (language === 'en' ? 'Keep Learning!' : language === 'hi' ? 'सीखते रहें!' : 'ಕಲಿಯುತ್ತಾ ಇರಿ!')
            }
          </AppText>
          <AppText variant="bodyLg" color={colors.textSecondary} style={styles.scoreText}>
            {language === 'en' 
              ? `You scored ${score} out of ${totalQuestions}!` 
              : language === 'hi'
              ? `आपने ${totalQuestions} में से ${score} अंक प्राप्त किए!`
              : `ನೀವು ${totalQuestions} ರಲ್ಲಿ ${score} ಅಂಕಗಳನ್ನು ಗಳಿಸಿದ್ದೀರಿ!`
            }
          </AppText>

          <TutorBubble
            message={passed
              ? (language === 'en' ? "Fantastic work! You've mastered this topic. Ready for the next adventure?" : "शानदार काम! आपने इस विषय में महारत हासिल कर ली है।")
              : (language === 'en' ? "Great try! Reread the lesson text once more and you will score even better!" : "अच्छा प्रयास! पाठ को एक बार फिर से पढ़ें और आप बेहतर स्कोर करेंगे!")
            }
            style={styles.summaryBubble}
          />

          <Button
            title={language === 'en' ? 'Back to Dashboard' : language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ'}
            onPress={handleFinish}
            style={styles.finishBtn}
          />
        </Card>
      </ScreenContainer>
    );
  }

  const progressValue = (currentIdx + 1) / totalQuestions;
  const questionText = activeQuestion.question[language] || activeQuestion.question.en;
  const optionsList = activeQuestion.options[language] || activeQuestion.options.en;
  const explanationText = activeQuestion.explanation[language] || activeQuestion.explanation.en;

  return (
    <ScreenContainer
      title={language === 'en' ? 'Practice Challenge' : language === 'hi' ? 'अभ्यास चुनौती' : 'ಅಭ್ಯಾಸ ಸವಾಲು'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
    >
      {/* Progress tracking wrapper */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <AppText variant="caption" color={colors.textSecondary} style={{ fontWeight: '700' }}>
            {language === 'en' 
              ? `QUESTION ${currentIdx + 1} OF ${totalQuestions}` 
              : language === 'hi'
              ? `प्रश्न ${currentIdx + 1} का ${totalQuestions}`
              : `ಪ್ರಶ್ನೆ ${currentIdx + 1} ರ ${totalQuestions}`
            }
          </AppText>
          <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700' }}>
            {score} Correct
          </AppText>
        </View>
        <ProgressBar progress={progressValue} color={colors.primary} />
      </View>

      {/* Encouraging speech bubble */}
      <View style={styles.tutorRow}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
          <AppText variant="heading2" color={colors.primary}>V</AppText>
        </View>
        <TutorBubble message={getTutorMessage()} style={styles.bubble} />
      </View>

      {/* Main MCQ Question Card */}
      <Card style={styles.questionCard}>
        <AppText variant="heading2" style={styles.questionText}>
          {questionText}
        </AppText>
      </Card>

      {/* MCQ Options List */}
      <View style={styles.optionsList}>
        {optionsList.map((option, idx) => {
          let optionStatus: 'none' | 'correct' | 'incorrect' = 'none';
          if (submitted) {
            if (idx === activeQuestion.correct_index) {
              optionStatus = 'correct';
            } else if (idx === selectedIdx) {
              optionStatus = 'incorrect'; // QuizOption renders warning colors internally
            }
          }

          return (
            <QuizOption
              key={idx}
              text={option}
              selected={selectedIdx === idx}
              status={optionStatus}
              disabled={submitted}
              onPress={() => setSelectedIdx(idx)}
              style={styles.optionItem}
            />
          );
        })}
      </View>

      {/* Adaptive Explanation Card */}
      {submitted && (
        <Card style={[styles.explanationCard, { borderLeftColor: colors.success }]}>
          <AppText variant="heading2" color={colors.success} style={styles.explTitle}>
            {selectedIdx === activeQuestion.correct_index
              ? (language === 'en' ? 'Correct!' : language === 'hi' ? 'सही उत्तर!' : 'ಸರಿಯಾದ ಉತ್ತರ!')
              : (language === 'en' ? 'Nice Try!' : language === 'hi' ? 'अच्छा प्रयास!' : 'ಉತ್ತಮ ಪ್ರಯತ್ನ!')
            }
          </AppText>
          <AppText variant="bodyLg" color={colors.textSecondary} style={{ lineHeight: 22 }}>
            {explanationText}
          </AppText>
        </Card>
      )}

      {/* CTA Control Buttons */}
      <View style={styles.actionSection}>
        {!submitted ? (
          <Button
            title={language === 'en' ? 'Submit Answer' : language === 'hi' ? 'उत्तर जमा करें' : 'ಉತ್ತರ ಸಲ್ಲಿಸಿ'}
            disabled={selectedIdx === null}
            onPress={handleSubmit}
          />
        ) : (
          <Button
            title={currentIdx + 1 < totalQuestions 
              ? (language === 'en' ? 'Next Question' : language === 'hi' ? 'अगला प्रश्न' : 'ಮುಂದಿನ ಪ್ರಶ್ನೆ')
              : (language === 'en' ? 'See Results' : language === 'hi' ? 'परिणाम देखें' : 'ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ')
            }
            onPress={handleNext}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  completeContainer: {
    justifyContent: 'center',
    paddingVertical: 40,
  },
  progressSection: {
    marginBottom: 8,
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    flex: 1,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  explanationCard: {
    padding: 16,
    borderLeftWidth: 5,
  },
  explTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  actionSection: {
    marginTop: 10,
  },
  summaryCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  trophy: {
    fontSize: 70,
    marginBottom: 10,
  },
  summaryTitle: {
    fontWeight: '800',
  },
  scoreText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryBubble: {
    width: '100%',
    marginVertical: 12,
  },
  finishBtn: {
    width: '100%',
    marginTop: 10,
  },
});
