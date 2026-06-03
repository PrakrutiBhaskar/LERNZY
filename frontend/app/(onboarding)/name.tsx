import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFrame } from '../../components/OnboardingFrame';
import { loadOnboardingProfile, saveOnboardingProfile } from '@/onboarding/profile';
import { useLanguage } from '@/i18n/LanguageContext';
import { getOnboardingCopy } from '@/onboarding/copy';
import { type ColorsType } from '@/theme/colors';
import { useTheme } from '@/theme/theme';

export default function NameScreen(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(language);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState('');

  useEffect(() => {
    let active = true;

    async function loadName() {
      const profile = await loadOnboardingProfile();
      if (active && typeof profile.name === 'string') {
        setName(profile.name);
      }
    }

    loadName();

    return () => {
      active = false;
    };
  }, []);

  const handleNext = async () => {
    await saveOnboardingProfile({ name: name.trim() });
    router.push('/(onboarding)/grade');
  };

  return (
    <OnboardingFrame
      title={copy.nameTitle}
      subtitle={copy.nameSubtitle}
      actionLabel={copy.next}
      onAction={handleNext}
      actionDisabled={!name.trim()}
      step={3}
    >
      <View style={styles.form}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={copy.namePlaceholder}
          placeholderTextColor={colors.textDisabled}
          maxLength={30}
          autoCapitalize="words"
          returnKeyType="done"
          style={styles.input}
        />
      </View>
    </OnboardingFrame>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  form: {
    width: '100%',
  },
  input: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 18,
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
});
