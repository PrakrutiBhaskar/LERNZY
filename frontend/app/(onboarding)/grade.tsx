import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { loadOnboardingProfile, saveOnboardingProfile } from '@/onboarding/profile';
import { useLanguage } from '@/i18n/LanguageContext';
import { getOnboardingCopy } from '@/onboarding/copy';

const GRADES = [6, 7, 8];

export default function GradeScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
  const [grade, setGrade] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadGrade() {
      const profile = await loadOnboardingProfile();
      const savedGrade = Number.parseInt(String(profile.grade || ''), 10);
      if (active && GRADES.includes(savedGrade)) {
        setGrade(savedGrade);
      }
    }

    loadGrade();

    return () => {
      active = false;
    };
  }, []);

  const handleNext = async () => {
    if (!grade) return;
    await saveOnboardingProfile({ grade });
    router.push('/(onboarding)/interests');
  };

  return (
    <OnboardingFrame
      title={copy.gradeTitle}
      subtitle={copy.gradeSubtitle}
      actionLabel={copy.next}
      onAction={handleNext}
      actionDisabled={!grade}
      step={4}
    >
      <View style={styles.grid}>
        {GRADES.map((item, index) => {
          const active = grade === item;

          return (
            <Pressable
              key={item}
              onPress={() => setGrade(item)}
              style={({ pressed }) => [
                styles.gradeCard,
                index > 0 && styles.gradeCardSpacing,
                active && styles.gradeCardActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <Text style={[styles.gradeNumber, active && styles.gradeNumberActive]}>
                {item}
              </Text>
              <Text style={[styles.gradeLabel, active && styles.gradeLabelActive]}>
                {copy.classLabel(item)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  gradeCardSpacing: {
    marginTop: 14,
  },
  gradeCard: {
    minHeight: 88,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 18,
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeCardActive: {
    borderColor: '#A78BFA',
    backgroundColor: '#241F3A',
  },
  pressed: {
    opacity: 0.78,
  },
  gradeNumber: {
    width: 52,
    height: 52,
    borderRadius: 26,
    color: '#A78BFA',
    backgroundColor: '#241F3A',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 24,
    lineHeight: 52,
    fontWeight: '900',
    marginRight: 18,
  },
  gradeNumberActive: {
    color: '#070A12',
    backgroundColor: '#A78BFA',
  },
  gradeLabel: {
    color: '#F8FAFC',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  gradeLabelActive: {
    color: '#C4B5FD',
  },
});
