import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, useSubjectColor } from '@/theme/theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Button } from './Button';
import { Play } from 'lucide-react-native';

export interface ContinueCardProps {
  subjectName: string;
  topicName: string;
  progressPercent: number;
  onResume: () => void;
}

/**
 * Reusable Continue Learning Card.
 * Highlights the student's last active lesson, rendering a large Resume CTA
 * with the subject's accent coloring.
 */
export const ContinueCard: React.FC<ContinueCardProps> = React.memo(({
  subjectName,
  topicName,
  progressPercent,
  onResume,
}) => {
  const { colors, spacing } = useTheme();
  const subjectColor = useSubjectColor(subjectName);

  return (
    <Card style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.infoCol}>
          <View style={styles.subjectHeader}>
            <View style={[styles.dot, { backgroundColor: subjectColor }]} />
            <AppText variant="caption" color={colors.textSecondary} style={styles.subjectText}>
              {subjectName.toUpperCase()}
            </AppText>
          </View>
          
          <AppText variant="heading2" style={styles.topicName} numberOfLines={1}>
            {topicName}
          </AppText>

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
              {progressPercent}% completed
            </AppText>
          </View>
        </View>

        <Button
          variant="primary"
          onPress={onResume}
          title=""
          icon={<Play size={20} color={colors.textOnPrimary} fill={colors.textOnPrimary} />}
          style={[styles.resumeBtn, { backgroundColor: subjectColor }]}
          accessible={true}
          accessibilityLabel={`Resume ${topicName} lesson`}
          accessibilityHint="Double tap to continue reading this lesson"
        />
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoCol: {
    flex: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjectText: {
    fontWeight: '700',
    letterSpacing: 0,
  },
  topicName: {
    fontWeight: '700',
    marginBottom: 10,
  },
  progressContainer: {
    gap: 4,
  },
  progressBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontWeight: '600',
  },
  resumeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    minHeight: 48,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
