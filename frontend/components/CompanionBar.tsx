import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Sparkles, Wifi } from 'lucide-react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

interface CompanionBarProps {
  onPress?: () => void;
}

export function CompanionBar({ onPress }: CompanionBarProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel="Open Vani learning companion"
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surfaceBright },
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
        <Sparkles size={22} strokeWidth={2.5} color={colors.textOnPrimary} />
      </View>
      <View style={styles.copy}>
        <AppText variant="body" style={styles.name}>
          Vani companion
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Your learning guide is close by
        </AppText>
      </View>
      <View style={[styles.offline, { backgroundColor: colors.successSubtle }]}>
        <Wifi size={15} strokeWidth={2.5} color={colors.success} />
        <AppText variant="caption" color={colors.success} style={styles.offlineText}>
          Offline ready
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
  },
  offline: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  offlineText: {
    fontWeight: '700',
  },
});
