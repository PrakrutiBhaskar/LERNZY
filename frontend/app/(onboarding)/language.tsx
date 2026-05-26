import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageCode } from '@/utils/constants';
import { saveOnboardingProfile } from '@/onboarding/profile';
import { getOnboardingCopy } from '@/onboarding/copy';

const LANGUAGE_CODES: LanguageCode[] = ['en', 'hi', 'kn'];

export default function LanguageScreen(): React.JSX.Element {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [selected, setSelected] = useState<LanguageCode>(language);
  const copy = getOnboardingCopy(selected);

  const handleNext = async () => {
    await setLanguage(selected);
    await saveOnboardingProfile({ language: selected });
    router.push('/(onboarding)/name');
  };

  return (
    <OnboardingFrame
      title={copy.languageTitle}
      subtitle={copy.languageSubtitle}
      actionLabel={copy.continue}
      onAction={handleNext}
      copyLanguage={selected}
      step={2}
    >
      <View style={styles.list}>
        {LANGUAGE_CODES.map((code, index) => {
          const active = selected === code;
          const item = copy.languages[code];

          return (
            <Pressable
              key={code}
              onPress={() => setSelected(code)}
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
              <View style={styles.optionText}>
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
    minHeight: 84,
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
  optionText: {
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
    marginTop: 2,
  },
});
