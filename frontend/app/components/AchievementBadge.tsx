import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';
import { Card } from './Card';

export interface AchievementBadgeProps {
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

/**
 * Reusable Achievement Badge.
 * Presents reward milestones, applying opacity and grayscale-like treatment
 * to locked states to encourage student interaction.
 */
export const AchievementBadge: React.FC<AchievementBadgeProps> = React.memo(({
  emoji,
  name,
  description,
  unlocked,
  unlockedAt,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <Card
      style={[
        styles.card,
        !unlocked && { opacity: 0.55 }
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Achievement: ${name}. ${description}. Status: ${unlocked ? 'Unlocked' : 'Locked'}.`}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.emojiWrapper,
            { backgroundColor: unlocked ? '#FFF8E7' : colors.surfaceAlt }
          ]}
        >
          <AppText variant="display" style={styles.emoji}>
            {emoji}
          </AppText>
        </View>

        <View style={styles.textContainer}>
          <AppText variant="heading2" style={styles.name} color={colors.textPrimary}>
            {name}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.desc}>
            {description}
          </AppText>
          {unlocked && unlockedAt && (
            <AppText variant="caption" color={colors.success} style={styles.date}>
              Earned: {unlockedAt}
            </AppText>
          )}
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    marginBottom: 2,
  },
  desc: {
    lineHeight: 18,
  },
  date: {
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
