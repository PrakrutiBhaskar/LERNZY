import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { TutorBubble } from '../../../components/TutorBubble';
import { FlashCard } from '../../../components/FlashCard';
import { ScreenContainer } from '../../../components/ScreenContainer';
import {
  FlashcardItem as LearningFlashcardItem,
  getFlashcards,
  getTopicSubject,
} from '@/content/learningContent';
import { ensureLocalStudent, getDb, isLocalDatabaseAvailable } from '@/db/database';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject } from '@/utils/storage';

interface FlashcardItem {
  id: string;
  front: { en: string; hi: string; kn: string };
  back: { en: string; hi: string; kn: string };
  memory_hook: { en: string; hi: string; kn: string };
}

const MOCK_FLASHCARDS_DB: Record<string, FlashcardItem[]> = {
  fractions: [
    {
      id: "fc001",
      front: {
        en: "What are unlike fractions?",
        hi: "असमान भिन्न क्या होती हैं?",
        kn: "ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳು ಯಾವುವು?"
      },
      back: {
        en: "Fractions with different denominators. For example, 1/3 and 1/4.",
        hi: "अलग-अलग हरों वाली भिन्नें। उदाहरण के लिए, 1/3 और 1/4।",
        kn: "ಬೇರೆ ಬೇರೆ ಛೇದಗಳನ್ನು ಹೊಂದಿರುವ ಭಿನ್ನರಾಶಿಗಳು. ಉದಾಹರಣೆಗೆ, 1/3 ಮತ್ತು 1/4."
      },
      memory_hook: {
        en: "Unlike = Different bottom numbers",
        hi: "असमान = अलग-अलग नीचे की संख्याएँ",
        kn: "ಅಸಮಾನ = ಬೇರೆ ಬೇರೆ ಕೆಳಗಿನ ಸಂಖ್ಯೆಗಳು"
      }
    },
    {
      id: "fc002",
      front: {
        en: "What is a denominator?",
        hi: "हर (Denominator) क्या है?",
        kn: "ಛೇದ (Denominator) ಎಂದರೇನು?"
      },
      back: {
        en: "The bottom number in a fraction that shows the total number of equal parts.",
        hi: "एक भिन्न में नीचे की संख्या जो कुल बराबर भागों को दर्शाती है।",
        kn: "ಭಿನ್ನರಾಶಿಯಲ್ಲಿನ ಕೆಳಗಿನ ಸಂಖ್ಯೆಯು ಒಟ್ಟು ಸಮಾನ ಭಾಗಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ."
      },
      memory_hook: {
        en: "Denominator = Down (bottom) number",
        hi: "हर = नीचे (Down) की संख्या",
        kn: "ಛೇದ = ಕೆಳಗಿನ (Down) ಸಂಖ್ಯೆ"
      }
    },
    {
      id: "fc003",
      front: {
        en: "What is a numerator?",
        hi: "अंश (Numerator) क्या है?",
        kn: "ಅಂಶ (Numerator) ಎಂದರೇನು?"
      },
      back: {
        en: "The top number in a fraction that shows how many parts we are taking.",
        hi: "एक भिन्न में ऊपर की संख्या जो दर्शाती है कि हम कितने भाग ले रहे हैं।",
        kn: "ಭಿನ್ನರಾಶಿಯಲ್ಲಿನ ಮೇಲಿನ ಸಂಖ್ಯೆಯು ನಾವು ತೆಗೆದುಕೊಳ್ಳುವ ಭಾಗಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ."
      },
      memory_hook: {
        en: "Numerator = Number on top",
        hi: "अंश = ऊपर की संख्या",
        kn: "ಅಂಶ = ಮೇಲಿನ ಸಂಖ್ಯೆ"
      }
    }
  ]
};

export default function FlashcardsScreen(): React.JSX.Element {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const key = topicId || 'fractions';
  const sourceCards = React.useMemo(() => getFlashcards(key), [key]);
  const subjectKey = React.useMemo(() => getTopicSubject(key), [key]);

  // Active stack of cards remaining in review session
  const [activeCards, setActiveCards] = useState<LearningFlashcardItem[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [tutorTip, setTutorTip] = useState<string>('');

  useEffect(() => {
    let sessionId: number | null = null;
    const startedAt = new Date().toISOString();
    
    async function startSession() {
      try {
        const db = getDb();
        const savedProfile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
        const studentId = await ensureLocalStudent(savedProfile || {});
        
        const result = await db.runAsync(
          `INSERT INTO sessions (student_id, subject, chapter_id, topic_id, mode, started_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [studentId, subjectKey, key, key, 'flashcard', startedAt]
        );
        sessionId = result.lastInsertRowId;
        console.log(`[Flashcard Session] Started: ${sessionId}`);
      } catch (err) {
        console.error('[Flashcard Session] Failed to start:', err);
      }
    }
    startSession();

    return () => {
      const endedAt = new Date().toISOString();
      const duration = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
      
      if (sessionId !== null) {
        async function endSession() {
          try {
            const db = getDb();
            await db.runAsync(
              `UPDATE sessions SET ended_at = ?, duration_seconds = ? WHERE id = ?`,
              [endedAt, duration, sessionId]
            );
            console.log(`[Flashcard Session] Ended: ${sessionId}`);
          } catch (err) {
            console.error('[Flashcard Session] Failed to end:', err);
          }
        }
        endSession();
      }
    };
  }, [subjectKey, key]);

  useEffect(() => {
    // Reset deck on mount
    setActiveCards([...sourceCards]);
    setTotalCount(sourceCards.length);
    setMasteredCount(0);
    setCurrentIdx(0);
    setSessionDone(false);
    setTutorTip(language === 'en' ? "Tap the card to flip it and review the answer." : "उत्तर देखने के लिए फ्लैशकार्ड पर tap करें।");
  }, [key, language, sourceCards]);

  const handleRating = (rating: 'hard' | 'good' | 'easy') => {
    if (activeCards.length === 0) return;

    const currentCard = activeCards[currentIdx];

    if (rating === 'hard') {
      // Spaced Repetition (SM-2): Move card to end of stack to review again soon
      const updated = [...activeCards];
      const [removed] = updated.splice(currentIdx, 1);
      setActiveCards([...updated, removed]);
      setTutorTip(language === 'en'
        ? "Got it! We'll show you this card again soon."
        : language === 'hi'
        ? "ठीक है! हम इस कार्ड को जल्द ही फिर से दिखाएंगे।"
        : "ಸರಿ! ಈ ಕಾರ್ಡ್ ಅನ್ನು ನಾವು ಶೀಘ್ರದಲ್ಲೇ ಮತ್ತೆ ತೋರಿಸುತ್ತೇವೆ."
      );
      // Point index back to 0 or keep it within bounds
      if (currentIdx >= updated.length) {
        setCurrentIdx(0);
      }
    } else {
      // Good or Easy: Remove from active stack (marked as completed)
      const updated = activeCards.filter((_, idx) => idx !== currentIdx);
      setActiveCards(updated);
      setMasteredCount((prev) => prev + 1);

      if (rating === 'easy') {
        setTutorTip(language === 'en' ? "Awesome! Mastered!" : language === 'hi' ? "शानदार! महारत हासिल की!" : "ಅದ್ಭುತ! ಕರಗತವಾಯಿತು!");
      } else {
        setTutorTip(language === 'en' ? "Good job! Keep going!" : language === 'hi' ? "बहुत बढ़िया! आगे बढ़ें!" : "ಉತ್ತಮ ಕೆಲಸ! ಮುಂದುವರಿಯಿರಿ!");
      }

      if (updated.length === 0) {
        setSessionDone(true);
      } else if (currentIdx >= updated.length) {
        setCurrentIdx(0);
      }
    }
  };

  const handleFinish = () => {
    router.replace('/(home)');
  };

  if (sessionDone) {
    return (
      <ScreenContainer
        title={language === 'en' ? 'Review Completed' : language === 'hi' ? 'पुनरीक्षण समाप्त' : 'ಪುನರಾವರ್ತನೆ ಪೂರ್ಣಗೊಂಡಿದೆ'}
        showBackButton={false}
        scrollable={true}
        contentContainerStyle={styles.completeContainer}
      >
        <Card style={styles.summaryCard}>
          <AppText variant="display" style={styles.trophy}>
            🎉
          </AppText>
          <AppText variant="heading1" style={styles.summaryTitle} color={colors.primary}>
            {language === 'en' ? 'Review Complete!' : language === 'hi' ? 'पुनरीक्षण पूरा हुआ!' : 'ವಿಮರ್ಶೆ ಪೂರ್ಣಗೊಂಡಿದೆ!'}
          </AppText>
          <AppText variant="bodyLg" color={colors.textSecondary} style={styles.scoreText}>
            {language === 'en'
              ? `You reviewed all ${totalCount} flashcards!`
              : language === 'hi'
              ? `आपने सभी ${totalCount} फ्लैशकार्ड का पुनरीक्षण किया!`
              : `ನೀವು ಎಲ್ಲಾ ${totalCount} ಫ್ಲ್ಯಾಶ್‌ಕಾರ್ಡ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೀರಿ!`
            }
          </AppText>

          <TutorBubble
            message={language === 'en'
              ? "Spaced repetition helps lock concepts in memory! Great work studying today!"
              : "स्मरण शक्ति मजबूत करने के लिए यह पुनरावृत्ति बहुत महत्वपूर्ण है! बहुत बढ़िया काम!"
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

  const activeCard = activeCards[currentIdx];
  const progressValue = totalCount > 0 ? masteredCount / totalCount : 0;

  return (
    <ScreenContainer
      title={language === 'en' ? 'Review Cards' : language === 'hi' ? 'कार्ड दोहराएं' : 'ಕಾರ್ಡ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
    >
      {/* Progress tracking */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <AppText variant="caption" color={colors.textSecondary} style={{ fontWeight: '700' }}>
            {language === 'en'
              ? `CARDS REMAINING: ${activeCards.length}`
              : language === 'hi'
              ? `शेष कार्ड: ${activeCards.length}`
              : `ಉಳಿದಿರುವ ಕಾರ್ಡ್‌ಗಳು: ${activeCards.length}`
            }
          </AppText>
          <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700' }}>
            {masteredCount} / {totalCount} Mastered
          </AppText>
        </View>
        <ProgressBar progress={progressValue} color={colors.primary} />
      </View>

      {/* Tutor Bubble Tips */}
      {tutorTip !== '' && (
        <View style={styles.tutorRow}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
            <AppText variant="heading2" color={colors.primary}>V</AppText>
          </View>
          <TutorBubble message={tutorTip} style={styles.bubble} />
        </View>
      )}

      {/* 3D animated flashcard */}
      {activeCard && (
        <View style={styles.cardArea}>
          <FlashCard
            key={activeCard.id} // reset flip state when card changes
            frontText={activeCard.front[language] || activeCard.front.en}
            backText={activeCard.back[language] || activeCard.back.en}
            hintText={language === 'en' ? 'TAP TO FLIP' : 'पलटने के लिए टैप करें'}
          />
        </View>
      )}

      {/* Memory Hook Display */}
      {activeCard && (
        <Card style={[styles.hookCard, { backgroundColor: colors.primarySubtle }]}>
          <AppText variant="caption" color={colors.primary} style={styles.hookLabel}>
            💡 MEMORY HOOK
          </AppText>
          <AppText variant="bodyLg" style={styles.hookText}>
            {activeCard.memory_hook[language] || activeCard.memory_hook.en}
          </AppText>
        </Card>
      )}

      {/* Spaced repetition review ratings */}
      <View style={styles.ratingsWrapper}>
        <AppText variant="caption" color={colors.textSecondary} style={styles.ratingsHint}>
          How well did you remember this concept?
        </AppText>
        <View style={styles.buttonsRow}>
          <Button
            title="Hard"
            variant="secondary"
            onPress={() => handleRating('hard')}
            style={[styles.ratingBtn, { backgroundColor: colors.warningSubtle }]}
          />
          <Button
            title="Good"
            onPress={() => handleRating('good')}
            style={[styles.ratingBtn, { backgroundColor: colors.primary }]}
          />
          <Button
            title="Easy"
            onPress={() => handleRating('easy')}
            style={[styles.ratingBtn, { backgroundColor: colors.success }]}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  completeContainer: {
    justifyContent: 'center',
    paddingVertical: 40,
  },
  progressSection: {
    marginBottom: 8,
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
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
  cardArea: {
    width: '100%',
    minHeight: 280,
  },
  hookCard: {
    padding: 18,
    marginTop: 4,
  },
  hookLabel: {
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0,
  },
  hookText: {
    lineHeight: 27,
    fontStyle: 'italic',
  },
  ratingsWrapper: {
    marginTop: 14,
    gap: 12,
    alignItems: 'center',
  },
  ratingsHint: {
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ratingBtn: {
    flex: 1,
    minHeight: 52,
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
