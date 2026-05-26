import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp, SafeAreaView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';
import { ChevronLeft } from 'lucide-react-native';

export interface ScreenContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Shared container for all screens.
 * Wraps content in a SafeAreaView with standard horizontal padding (space5),
 * configures KeyboardAvoidingView for inputs, and optionally embeds a ScrollView.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  scrollable = true,
  style,
  contentContainerStyle,
}) => {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const renderHeader = () => {
    if (!title && !showBackButton) return null;

    return (
      <View style={[styles.headerContainer, { marginBottom: spacing.space4 }]}>
        {showBackButton && (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surfaceAlt },
              pressed && { opacity: 0.7 },
            ]}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </Pressable>
        )}
        <View style={styles.titleContainer}>
          {title && (
            <AppText variant="heading1" style={styles.title} color={colors.textPrimary}>
              {title}
            </AppText>
          )}
          {subtitle && (
            <AppText variant="bodySm" color={colors.textSecondary}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
    );
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.bg },
    style,
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {renderHeader()}
        {scrollable ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: spacing.space5, paddingBottom: spacing.space8 },
              contentContainerStyle,
            ]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { paddingHorizontal: spacing.space5 }, contentContainerStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
  },
});
