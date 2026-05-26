import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';

export default function ProgressScreen(): React.JSX.Element {
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  return (
    <ScreenContainer
      title={language === 'en' ? 'My Progress' : language === 'hi' ? 'मेरी प्रगति' : 'ನನ್ನ ಪ್ರಗತಿ'}
      subtitle={language === 'en' ? 'Track your offline learning achievements' : language === 'hi' ? 'अपनी ऑफ़लाइन सीखने की उपलब्धियों को ट्रैक करें' : 'ನಿಮ್ಮ ಕಲಿಕೆಯ ಪ್ರಗತಿಯನ್ನು ಇಲ್ಲಿ ನೋಡಿ'}
      showBackButton={true}
      scrollable={true}
    >
      <View style={styles.container}>
        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <AppText variant="display" color={colors.primary} style={styles.statNum}>
              120
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={styles.statLabel}>
              {language === 'en' ? 'Mins Learnt' : language === 'hi' ? 'मिनट सीखा' : 'ನಿಮಿಷ ಕಲಿಕೆ'}
            </AppText>
          </Card>

          <Card style={styles.statCard}>
            <AppText variant="display" color={colors.success} style={styles.statNum}>
              5
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={styles.statLabel}>
              {language === 'en' ? 'Quizzes Done' : language === 'hi' ? 'क्विज़ पूर्ण' : 'ರಸಪ್ರಶ್ನೆಗಳು'}
            </AppText>
          </Card>
        </View>

        {/* Dynamic overall progress */}
        <Card style={styles.overallCard}>
          <AppText variant="heading2" style={styles.sectionTitle}>
            {language === 'en' ? 'Syllabus Complete' : language === 'hi' ? 'पाठ्यक्रम पूरा' : 'ಪಠ್ಯಕ್ರಮ ಪೂರ್ಣಗೊಂಡಿದೆ'}
          </AppText>
          <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '65%' }]} />
          </View>
          <AppText variant="caption" color={colors.textSecondary} style={styles.percentText}>
            65% {language === 'en' ? 'Overall Progress' : language === 'hi' ? 'कुल प्रगति' : 'ಒಟ್ಟು ಪ್ರಗತಿ'}
          </AppText>
        </Card>

        {/* Badges Section */}
        <AppText variant="heading1" style={styles.sectionHeader}>
          {language === 'en' ? 'Badges Unlocked' : language === 'hi' ? 'अनलॉक किए गए बैज' : 'ಪಡೆದ ಬ್ಯಾಡ್ಜ್‌ಗಳು'}
        </AppText>

        <View style={styles.badgesList}>
          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBg, { backgroundColor: '#FFF9E6' }]}>
              <AppText variant="display">🏆</AppText>
            </View>
            <View style={styles.badgeText}>
              <AppText variant="heading2" style={styles.badgeName}>
                {language === 'en' ? 'First Steps' : language === 'hi' ? 'पहला कदम' : 'ಮೊದಲ ಹೆಜ್ಜೆ'}
              </AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {language === 'en' ? 'Completed your first offline topic.' : language === 'hi' ? 'अपना पहला ऑफ़लाइन विषय पूरा किया।' : 'ನಿಮ್ಮ ಮೊದಲ ಆಫ್‌ಲೈನ್ ಪಾಠವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ.'}
              </AppText>
            </View>
          </Card>

          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBg, { backgroundColor: '#EBF5FF' }]}>
              <AppText variant="display">🔥</AppText>
            </View>
            <View style={styles.badgeText}>
              <AppText variant="heading2" style={styles.badgeName}>
                {language === 'en' ? 'Quiz Whiz' : language === 'hi' ? 'क्विज़ विज़' : 'ರಸಪ್ರಶ್ನೆ ಚತುರ'}
              </AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {language === 'en' ? 'Scored 100% on any lesson quiz.' : language === 'hi' ? 'किसी भी पाठ प्रश्नोत्तरी में 100% स्कोर किया।' : 'ರಸಪ್ರಶ್ನೆಯಲ್ಲಿ 100% ಅಂಕಗಳನ್ನು ಗಳಿಸಿದ್ದೀರಿ.'}
              </AppText>
            </View>
          </Card>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statNum: {
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontWeight: '600',
  },
  overallCard: {
    padding: 18,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  progressBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentText: {
    fontWeight: '600',
  },
  sectionHeader: {
    fontWeight: '700',
    marginTop: 8,
  },
  badgesList: {
    gap: 12,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  badgeIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    flex: 1,
  },
  badgeName: {
    fontWeight: '700',
    marginBottom: 2,
  },
});
