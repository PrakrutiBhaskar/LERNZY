import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Bot, Check, Landmark, Leaf, Orbit, Trophy } from 'lucide-react-native';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { loadOnboardingProfile, saveOnboardingProfile } from '@/onboarding/profile';
import { useLanguage } from '@/i18n/LanguageContext';
import { getOnboardingCopy } from '@/onboarding/copy';
import { type ColorsType } from '@/theme/colors';
import { useTheme } from '@/theme/theme';

const INTEREST_IDS = ['space', 'nature', 'robots', 'sports', 'stories', 'history'] as const;
const INTEREST_ICONS = {
  space: Orbit,
  nature: Leaf,
  robots: Bot,
  sports: Trophy,
  stories: BookOpen,
  history: Landmark,
} as const;

export default function InterestsScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function loadInterests() {
      const profile = await loadOnboardingProfile();
      if (active) {
        setSelected(profile.interests);
      }
    }

    loadInterests();

    return () => {
      active = false;
    };
  }, []);

  const toggleInterest = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleNext = async () => {
    await saveOnboardingProfile({ interests: selected });
    router.push('/(onboarding)/learning-style');
  };

  return (
    <OnboardingFrame
      title={copy.interestsTitle}
      subtitle={copy.interestsSubtitle}
      actionLabel={copy.next}
      onAction={handleNext}
      actionDisabled={selected.length === 0}
      step={5}
    >
      <View style={styles.grid}>
        {INTEREST_IDS.map((id, index) => {
          const active = selected.includes(id);
          const item = copy.interests[id];
          const InterestIcon = INTEREST_ICONS[id];

          return (
            <Pressable
              key={id}
              onPress={() => toggleInterest(id)}
              style={({ pressed }) => [
                styles.card,
                index > 1 && styles.cardRowSpacing,
                active && styles.cardActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
            >
              <InterestIcon
                size={42}
                strokeWidth={2.4}
                color={active ? colors.primary : colors.tertiary}
                style={styles.interestIcon}
              />
              <View style={[styles.check, active && styles.checkActive]}>
                {active ? <Check size={15} color={colors.textOnPrimary} strokeWidth={3} /> : null}
              </View>
              <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                {item.title}
              </Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingFrame>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    minHeight: 132,
    borderRadius: 24,
    backgroundColor: colors.tertiaryFixed,
    padding: 14,
    overflow: 'hidden',
  },
  cardRowSpacing: {
    marginTop: 12,
  },
  cardActive: {
    backgroundColor: colors.primarySubtle,
  },
  pressed: {
    opacity: 0.78,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkActive: {
    backgroundColor: colors.primaryContainer,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  cardTitleActive: {
    color: colors.primary,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  interestIcon: {
    position: 'absolute',
    top: -7,
    right: -5,
    opacity: 0.38,
  },
});
