import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import {
  LearningStyleId,
  loadOnboardingProfile,
  saveOnboardingProfile,
} from '@/onboarding/profile';
import { useLanguage } from '@/i18n/LanguageContext';
import { getOnboardingCopy } from '@/onboarding/copy';

type SelectableLearningStyle = Exclude<LearningStyleId, 'mixed'>;

const STYLE_IDS: SelectableLearningStyle[] = ['reading', 'audio', 'quiz'];

export default function LearningStyleScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
  const [selected, setSelected] = useState<SelectableLearningStyle | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStyle() {
      const profile = await loadOnboardingProfile();
      if (active && typeof profile.learningStyle === 'string' && profile.learningStyle !== 'mixed') {
        setSelected(profile.learningStyle as SelectableLearningStyle);
      }
    }

    loadStyle();

    return () => {
      active = false;
    };
  }, []);

  const handleNext = async () => {
    if (!selected) return;
    await saveOnboardingProfile({ learningStyle: selected });
    router.push('/(onboarding)/done');
  };

  return (
    <OnboardingFrame
      title={copy.learningTitle}
      subtitle={copy.learningSubtitle}
      actionLabel={copy.next}
      onAction={handleNext}
      actionDisabled={!selected}
      step={6}
    >
      <View style={styles.list}>
        {STYLE_IDS.map((id, index) => {
          const active = selected === id;
          const item = copy.learningStyles[id];

          return (
            <Pressable
              key={id}
              onPress={() => setSelected(id)}
              style={({ pressed }) => [
                styles.option,
                index > 0 && styles.optionSpacing,
                active && styles.optionActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.textCol}>
                <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                  {item.title}
                </Text>
                <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  optionSpacing: {
    marginTop: 14,
  },
  option: {
    minHeight: 94,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 18,
    backgroundColor: '#111827',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionActive: {
    borderColor: '#A78BFA',
    backgroundColor: '#241F3A',
  },
  pressed: {
    opacity: 0.78,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioActive: {
    borderColor: '#A78BFA',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A78BFA',
  },
  textCol: {
    flex: 1,
  },
  optionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  optionTitleActive: {
    color: '#C4B5FD',
  },
  optionSubtitle: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
