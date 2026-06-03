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
import { type ColorsType } from '@/theme/colors';
import { useTheme } from '@/theme/theme';

type SelectableLearningStyle = Exclude<LearningStyleId, 'mixed'>;

const STYLE_IDS: SelectableLearningStyle[] = ['reading', 'audio', 'quiz'];

export default function LearningStyleScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
  const { colors } = useTheme();
  const styles = createStyles(colors);
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

const createStyles = (colors: ColorsType) => StyleSheet.create({
  list: {
    width: '100%',
  },
  optionSpacing: {
    marginTop: 14,
  },
  option: {
    minHeight: 94,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLowest,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.primarySubtle,
  },
  pressed: {
    opacity: 0.78,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioActive: {
    backgroundColor: colors.primaryContainer,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textOnPrimary,
  },
  textCol: {
    flex: 1,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  optionTitleActive: {
    color: colors.primary,
  },
  optionSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
