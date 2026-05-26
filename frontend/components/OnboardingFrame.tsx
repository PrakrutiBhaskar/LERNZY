import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageCode } from '@/utils/constants';
import { getOnboardingCopy } from '@/onboarding/copy';

interface OnboardingFrameProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel: string;
  onAction: () => void | Promise<void>;
  actionDisabled?: boolean;
  showBack?: boolean;
  step?: number;
  totalSteps?: number;
  copyLanguage?: LanguageCode;
  contentStyle?: ViewStyle;
}

export function OnboardingFrame({
  children,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionDisabled = false,
  showBack = true,
  step,
  totalSteps = 6,
  copyLanguage,
  contentStyle,
}: OnboardingFrameProps): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const copy = getOnboardingCopy(copyLanguage || language);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const disabled = actionDisabled || busy;

  const handleAction = async () => {
    if (disabled) return;
    try {
      setActionError(null);
      setBusy(true);
      await onAction();
    } catch (error) {
      console.warn('Onboarding action failed:', error);
      setActionError(copy.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.header}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={copy.back}
            >
              <ChevronLeft size={24} color="#A78BFA" />
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {typeof step === 'number' && (
            <View style={styles.stepBlock}>
              <Text style={styles.stepText}>{copy.stepLabel(step, totalSteps)}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (step / totalSteps) * 100)}%` },
                  ]}
                />
              </View>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.body}>{children}</View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
          <Pressable
            onPress={handleAction}
            disabled={disabled}
            style={({ pressed }) => [
              styles.actionButton,
              disabled && styles.actionButtonDisabled,
              pressed && !disabled && styles.actionButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
          >
            <Text style={[styles.actionText, disabled && styles.actionTextDisabled]}>
              {busy ? copy.busy : actionLabel}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  keyboard: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
  },
  backPlaceholder: {
    width: 44,
    height: 44,
  },
  pressed: {
    opacity: 0.72,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  stepBlock: {
    marginBottom: 22,
  },
  stepText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1F2937',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#A78BFA',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    textAlign: 'left',
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'left',
    marginTop: 10,
  },
  body: {
    flex: 1,
    marginTop: 28,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    backgroundColor: '#070A12',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionButton: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  actionButtonDisabled: {
    backgroundColor: '#1F2937',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionText: {
    color: '#070A12',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  actionTextDisabled: {
    color: '#64748B',
  },
});
