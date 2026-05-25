import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';

interface CardData {
  front: string;
  back: string;
}

const SAMPLE_CARDS: Record<string, CardData[]> = {
  fractions: [
    { front: "Numerator", back: "The top number in a fraction that shows how many parts we are taking." },
    { front: "Denominator", back: "The bottom number in a fraction that shows the total number of equal parts." },
    { front: "Equivalent Fractions", back: "Fractions that have different numbers but represent the exact same value (e.g. 1/2 and 2/4)." }
  ],
  forces: [
    { front: "Gravity", back: "An attractive force that exists between all objects with mass." },
    { front: "Friction", back: "A force that opposes motion between two surfaces that are touching." }
  ]
};

export default function FlashcardsScreen(): React.JSX.Element {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const key = topicId || 'fractions';
  const defaultCards = [
    { front: `Concept Front for ${topicId}`, back: "Concept explanation on the back of the card." }
  ];

  const cards = SAMPLE_CARDS[key] || defaultCards;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const card = cards[currentIdx];

  return (
    <ScreenContainer
      title={language === 'en' ? 'Study Flashcards' : language === 'hi' ? 'फ्लैशकार्ड सीखें' : 'ಫ್ಲ್ಯಾಶ್‌ಕಾರ್ಡ್‌ಗಳು'}
      showBackButton={true}
      scrollable={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.cardSection}>
        <AppText variant="body" color={colors.textSecondary} style={styles.counter}>
          {language === 'en' ? `Card ${currentIdx + 1} of ${cards.length}` : language === 'hi' ? `कार्ड ${currentIdx + 1}/${cards.length}` : `ಕಾರ್ಡ್ ${currentIdx + 1}/${cards.length}`}
        </AppText>

        {/* Flipped Card */}
        <Pressable
          onPress={() => setIsFlipped(!isFlipped)}
          style={styles.pressableCard}
        >
          <Card
            style={[
              styles.flashcard,
              isFlipped ? { borderColor: colors.primary, borderWidth: 2 } : null
            ]}
          >
            <View style={styles.cardContent}>
              <AppText variant="caption" color={colors.textSecondary} style={styles.hint}>
                {isFlipped 
                  ? (language === 'en' ? 'REVEALED' : language === 'hi' ? 'खुला हुआ' : 'ತಿಳಿದಿದೆ')
                  : (language === 'en' ? 'TAP TO FLIP' : language === 'hi' ? 'पलटने के लिए टैप करें' : 'ತಿರುಗಿಸಲು ಒತ್ತಿ')}
              </AppText>

              <AppText
                variant="display"
                style={[
                  styles.cardText,
                  isFlipped ? styles.backText : styles.frontText
                ]}
              >
                {isFlipped ? card.back : card.front}
              </AppText>
            </View>
          </Card>
        </Pressable>
      </View>

      {/* Nav Controls */}
      <View style={[styles.controls, { marginBottom: spacing.space4 }]}>
        <Button
          variant="secondary"
          title={language === 'en' ? 'Previous' : language === 'hi' ? 'पीछे' : 'ಹಿಂದಿನ'}
          onPress={handlePrev}
          style={styles.ctrlBtn}
        />
        <Button
          title={language === 'en' ? 'Next' : language === 'hi' ? 'आगे' : 'ಮುಂದಿನ'}
          onPress={handleNext}
          style={styles.ctrlBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flex: 1,
  },
  cardSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  counter: {
    fontWeight: '600',
    marginBottom: 16,
  },
  pressableCard: {
    width: '100%',
    height: '70%',
    maxHeight: 380,
  },
  flashcard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  hint: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    position: 'absolute',
    top: 0,
  },
  cardText: {
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 34,
  },
  frontText: {
    fontSize: 28,
  },
  backText: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ctrlBtn: {
    flex: 1,
  },
});
