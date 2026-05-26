import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';

export interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

/**
 * Standardized Section Header component.
 * Displays heading categories with optional trailing pressable link actions (e.g. "View All").
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <AppText
        variant="heading1"
        style={styles.title}
        color={colors.textPrimary}
        accessible={true}
        accessibilityRole="header"
      >
        {title}
      </AppText>
      
      {actionText && onActionPress && (
        <Pressable
          onPress={onActionPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={actionText}
          style={({ pressed }) => [
            styles.action,
            pressed && { opacity: 0.7 }
          ]}
        >
          <AppText variant="body" color={colors.primary} style={styles.actionText}>
            {actionText}
          </AppText>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontWeight: '700',
  },
  action: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontWeight: '700',
  },
});
