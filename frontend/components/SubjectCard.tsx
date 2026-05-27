import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useTheme, useSubjectColor } from '@/theme/theme';
import { AppText } from './AppText';
import { Card } from './Card';

export interface SubjectCardProps {
  id: string;
  name: string;
  description: string;
  topicCount: number;
  progressPercent: number;
  iconName: string;
  onPress: () => void;
}

/**
 * Child-friendly Subject Card.
 * Displays subject metrics, progress percentages, and incorporates
 * subject-specific accent colors and icons.
 */
export const SubjectCard: React.FC<SubjectCardProps> = React.memo(({
  id,
  name,
  description,
  topicCount,
  progressPercent,
  iconName,
  onPress,
}) => {
  const { colors, spacing } = useTheme();
  const subjectColor = useSubjectColor(name);
  
  // Dynamically resolve icon from Lucide React Native namespace
  const IconComponent = (Icons as any)[iconName] || Icons.BookOpen;

  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        { borderLeftWidth: 6, borderLeftColor: subjectColor }
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Subject: ${name}. ${topicCount} topics. ${progressPercent} percent completed.`}
      accessibilityHint="Double tap to open subject topics list"
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: `${subjectColor}15` }]}>
            <IconComponent size={22} color={subjectColor} />
          </View>
          <AppText variant="heading2" style={styles.name}>
            {name}
          </AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
          <AppText variant="caption" color={colors.textSecondary}>
            {topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}
          </AppText>
        </View>
      </View>

      <AppText variant="body" color={colors.textSecondary} style={styles.desc}>
        {description}
      </AppText>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: subjectColor, width: `${progressPercent}%` }
            ]}
          />
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={styles.progressText}>
          {progressPercent}%
        </AppText>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingLeft: 16,
    paddingVertical: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  desc: {
    marginBottom: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
});
