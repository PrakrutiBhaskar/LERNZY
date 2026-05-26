import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { loadOnboardingProfile, saveOnboardingProfile } from '@/onboarding/profile';
import { useLanguage } from '@/i18n/LanguageContext';
import { getOnboardingCopy } from '@/onboarding/copy';

const INTEREST_IDS = ['space', 'nature', 'robots', 'sports', 'stories', 'history'] as const;

export default function InterestsScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
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
              <View style={[styles.check, active && styles.checkActive]}>
                {active ? <Check size={15} color="#070A12" strokeWidth={3} /> : null}
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

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    minHeight: 132,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 16,
    backgroundColor: '#111827',
    padding: 14,
  },
  cardRowSpacing: {
    marginTop: 12,
  },
  cardActive: {
    borderColor: '#A78BFA',
    backgroundColor: '#241F3A',
  },
  pressed: {
    opacity: 0.78,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkActive: {
    borderColor: '#A78BFA',
    backgroundColor: '#A78BFA',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  cardTitleActive: {
    color: '#C4B5FD',
  },
  cardSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
