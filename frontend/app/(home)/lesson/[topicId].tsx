import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../../components/AppText';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { TutorBubble } from '../../../components/TutorBubble';
import { DiagramViewer } from '../../../components/DiagramViewer';
import { VoiceInput } from '../../../components/VoiceInput';
import { LoadingDots } from '../../../components/LoadingDots';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { STORAGE_KEYS } from '@/utils/constants';
import { getObject } from '@/utils/storage';
import { ArrowLeft, BookOpen, Volume2 } from 'lucide-react-native';
import { getDb } from '@/db/database';
import { queueProgressEvent } from '@/services/sync';
import { apiFetch } from '@/services/api';

const MOCK_LESSONS_DB: Record<string, any> = {
  fractions: {
    topic_id: "addition_unlike_fractions",
    title: {
      en: "Addition of Unlike Fractions",
      hi: "असमान भिन्नों का योग",
      kn: "ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳ ಸೇರ್ಪಡೆ"
    },
    learning_objectives: [
      "Understand unlike fractions (different denominators)",
      "Find Least Common Multiple (LCM) of denominators",
      "Convert and add the numerators"
    ],
    estimated_minutes: 10,
    base_story_template: {
      en: "{{STUDENT_NAME}} was sitting at the {{INTEREST_PLACE}} sharing a pizza. One friend ate 1/3 of the pizza, and another ate 1/4. How much did they eat together? That is exactly what adding unlike fractions helps us find out!",
      hi: "{{STUDENT_NAME}} {{INTEREST_PLACE}} में बैठा था और पिज्जा खा रहा था। एक दोस्त ने पिज्जा का 1/3 हिस्सा खाया, और दूसरे ने 1/4 खाया। उन्होंने मिलकर कुल कितना खाया? यही असमान भिन्नों का जोड़ हमें सिखाता है!",
      kn: "{{STUDENT_NAME}} {{INTEREST_PLACE}} ನಲ್ಲಿ ಪಿಜ್ಜಾ ತಿನ್ನುತ್ತಿದ್ದ. ಒಬ್ಬ ಗೆಳೆಯ 1/3 ಭಾಗ ಪಿಜ್ಜಾ ತಿಂದರೆ, ಮತ್ತೊಬ್ಬ 1/4 ತಿಂದನು. ಇಬ್ಬರೂ ಸೇರಿ ಎಷ್ಟು ತಿಂದರು? ಇಂತಹ ಲೆಕ್ಕವನ್ನು ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳ ಕೂಡುವಿಕೆ ನಮಗೆ ತಿಳಿಸಿಕೊಡುತ್ತದೆ!"
    },
    concept_explanation: {
      en: "Unlike fractions have different denominators (bottom numbers). To add them, we find a common denominator by calculating the LCM of both bottom numbers. We convert each fraction, then add the top numbers (numerators) while keeping the bottom number the same.",
      hi: "असमान भिन्नों के हर (नीचे की संख्याएँ) अलग-अलग होते हैं। उन्हें जोड़ने के लिए, हम दोनों हरों का LCM (लघुत्तम समापवर्त्य) निकालकर एक समान हर प्राप्त करते हैं। फिर अंशों को जोड़ते हैं!",
      kn: "ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳು ಬೇರೆ ಬೇರೆ ಛೇದಗಳನ್ನು ಹೊಂದಿರುತ್ತವೆ. ಇವುಗಳನ್ನು ಕೂಡಲು ಮೊದಲು ಛೇದಗಳ ಲಸಾಅ (LCM) ಕಂಡುಹಿಡಿಯಬೇಕು. ನಂತರ ಭಿನ್ನರಾಶಿಗಳನ್ನು ಸಮಾನ ರೂಪಕ್ಕೆ ತಂದು ಅಂಶಗಳನ್ನು ಕೂಡಬೇಕು!"
    },
    worked_example: {
      problem: "1/3 + 1/4 = ?",
      steps: {
        en: [
          "Step 1: Find the LCM of 3 and 4. The LCM is 12.",
          "Step 2: Convert: Multiply 1/3 by 4/4 to get 4/12. Multiply 1/4 by 3/3 to get 3/12.",
          "Step 3: Add: 4/12 + 3/12 = 7/12."
        ],
        hi: [
          "चरण 1: 3 और 4 का LCM ज्ञात करें। LCM 12 है।",
          "चरण 2: बदलें: 1/3 को 4/12 में बदलें, 1/4 को 3/12 में बदलें।",
          "चरण 3: जोड़ें: 4/12 + 3/12 = 7/12।"
        ],
        kn: [
          "ಹಂತ 1: 3 ಮತ್ತು 4 ರ ಲಸಾಅ (LCM) ಕಂಡುಹಿಡಿಯಿರಿ. ಲಸಾಅ 12 ಆಗಿದೆ.",
          "ಹಂತ 2: ಪರಿವರ್ತಿಸಿ: 1/3 ಇದು 4/12 ಆಗುತ್ತದೆ, 1/4 ಇದು 3/12 ಆಗುತ್ತದೆ.",
          "ಹಂತ 3: ಕೂಡಿರಿ: 4/12 + 3/12 = 7/12."
        ]
      },
      answer: "7/12"
    },
    key_points: {
      en: [
        "Denominators (bottom numbers) must be matching before adding.",
        "Use LCM to rewrite fractions safely.",
        "Add numerators only; never add denominators together!"
      ],
      hi: [
        "जोड़ने से पहले हर (नीचे की संख्या) समान होना आवश्यक है।",
        "भिन्नों को सुरक्षित रूप से बदलने के लिए LCM का उपयोग करें।",
        "केवल अंशों को जोड़ें; हरों को आपस में कभी न जोड़ें!"
      ],
      kn: [
        "ಕೂಡುವ ಮೊದಲು ಛೇದಗಳು (ಕೆಳಗಿನ ಸಂಖ್ಯೆಗಳು) ಒಂದೇ ಇರಬೇಕು.",
        "ಭಿನ್ನರಾಶಿಗಳನ್ನು ಬದಲಾಯಿಸಲು ಲಸಾಅ (LCM) ಬಳಸಿ.",
        "ಅಂಶಗಳನ್ನು ಮಾತ್ರ ಕೂಡಿ; ಛೇದಗಳನ್ನು ಒಟ್ಟಿಗೆ ಕೂಡಬೇಡಿ!"
      ]
    },
    interest_placeholders: {
      INTEREST_PLACE: {
        space: { en: "space shuttle command desk", hi: "अंतरिक्ष यान कमांड डेस्क", kn: "ಬಾಹ್ಯಾಕಾಶ ನೌಕೆಯ ನಿಯಂತ್ರಣ ಕೊಠಡಿ" },
        nature: { en: "green forest camp", hi: "हरे-भरे जंगल के शिविर", kn: "ಹಸಿರು ಕಾಡಿನ ಕ್ಯಾಂಪ್" },
        robots: { en: "robotics programming desk", hi: "रोबोटिक्स लैब की मेज", kn: "ರೋಬೋಟಿಕ್ಸ್ ಲ್ಯಾಬ್ ಡೆಸ್ಕ್" },
        history: { en: "ancient museum library", hi: "प्राचीन संग्रहालय पुस्तकालय", kn: "ಪುರಾತನ ವಸ್ತುಸಂಗ್ರಹಾಲಯದ ಗ್ರಂಥಾಲಯ" },
        sports: { en: "cricket ground stadium", hi: "क्रिकेट स्टेडियम", kn: "ಕ್ರಿಕೆಟ್ ಸ್ಟೇಡಿಯಂ" },
        stories: { en: "fairytale treehouse study room", hi: "परियों के ट्रीहाउस स्टडी रूम", kn: "ಕಾಲ್ಪನಿಕ ಮರದ ಮನೆಯ ಓದುವ ಕೋಣೆ" },
        default: { en: "school classroom canteen", hi: "स्कूल कैंटीन", kn: "ಶಾಲೆಯ ಕ್ಯಾಂಟೀನ್" }
      }
    }
  }
};

export default function LessonScreen(): React.JSX.Element {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { language } = useLanguage();
  const { colors, spacing, radius } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string; interests?: string[] }>({ name: 'Friend', interests: ['space'] });
  const [isNarrating, setIsNarrating] = useState(false);

  // Get current topic structure or fallback
  const [currentTopic, setCurrentTopic] = useState<any>(
    MOCK_LESSONS_DB[topicId || 'fractions'] || MOCK_LESSONS_DB.fractions
  );

  useEffect(() => {
    async function loadLessonProfile() {
      try {
        setIsLoading(true);
        const savedProfile = await getObject<any>(STORAGE_KEYS.STUDENT_PROFILE);
        if (savedProfile) {
          setProfile(savedProfile);
        }
        
        // Fully integrated backend fetch
        try {
          const response = await apiFetch(`/api/v1/topics/${topicId || 'fractions'}/lessons`);
          if (response.ok) {
            const res = await response.json();
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
              const firstLessonNode = res.data[0];
              if (firstLessonNode && firstLessonNode.metadata) {
                setCurrentTopic(firstLessonNode.metadata);
                console.log('[Lesson Integration] Successfully loaded lesson node from backend:', firstLessonNode.name);
              }
            }
          }
        } catch (apiErr: any) {
          console.log('[Lesson Integration] Failed to fetch lesson from server, falling back to local asset map:', apiErr.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLessonProfile();
  }, [topicId]);

  useEffect(() => {
    let sessionId: number | null = null;
    const startedAt = new Date().toISOString();
    
    async function startSession() {
      try {
        const db = getDb();
        const student = await db.getFirstAsync<{ id: number }>('SELECT id FROM students LIMIT 1');
        const studentId = student ? student.id : 1;
        
        const result = await db.runAsync(
          `INSERT INTO sessions (student_id, subject, chapter_id, topic_id, mode, started_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [studentId, 'mathematics', topicId || 'fractions', topicId || 'fractions', 'lesson', startedAt]
        );
        sessionId = result.lastInsertRowId;
        console.log(`[Session Sync] Started lesson session: ${sessionId}`);
      } catch (err) {
        console.error('[Session Sync] Failed to start session:', err);
      }
    }
    startSession();

    return () => {
      // End session on unmount
      const endedAt = new Date().toISOString();
      const duration = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
      
      if (sessionId !== null) {
        async function endSession() {
          try {
            const db = getDb();
            await db.runAsync(
              `UPDATE sessions SET ended_at = ?, duration_seconds = ? WHERE id = ?`,
              [endedAt, duration, sessionId]
            );
            
            // Queue the sync event for backend integration (rewards 10 XP on coding)
            await queueProgressEvent('lesson_completed', 'coding', {
              topicId: topicId || 'fractions',
              durationSeconds: duration
            });
            console.log(`[Session Sync] Ended & queued lesson_completed event for: ${topicId || 'fractions'}`);
          } catch (err) {
            console.error('[Session Sync] Failed to end session:', err);
          }
        }
        endSession();
      }
    };
  }, [topicId]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.bg }]}>
        <LoadingDots />
        <AppText variant="body" color={colors.textSecondary} style={{ marginTop: 10 }}>
          {language === 'en' ? 'Preparing offline lesson weight maps...' : 'ऑफलाइन पाठ लोड हो रहा है...'}
        </AppText>
      </SafeAreaView>
    );
  }

  // Inject student name and interest variables
  const interestKey = (profile?.interests && profile.interests.length > 0) ? profile.interests[0] : 'default';
  const interestPlace = currentTopic.interest_placeholders.INTEREST_PLACE[interestKey]?.[language] ||
                        currentTopic.interest_placeholders.INTEREST_PLACE[interestKey]?.en || 'classroom';
  
  const baseStory = currentTopic.base_story_template[language] || currentTopic.base_story_template.en;
  const resolvedStory = baseStory
    .replace('{{STUDENT_NAME}}', profile?.name || 'Friend')
    .replace('{{INTEREST_PLACE}}', interestPlace);

  const titleText = currentTopic.title[language] || currentTopic.title.en;
  const conceptText = currentTopic.concept_explanation[language] || currentTopic.concept_explanation.en;
  const stepsList = currentTopic.worked_example.steps[language] || currentTopic.worked_example.steps.en;
  const keyPointsList = currentTopic.key_points[language] || currentTopic.key_points.en;

  return (
    <ScreenContainer
      title={titleText}
      scrollable={true}
      contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
    >
      {/* Estimated Reading Time / Header row */}
      <View style={styles.metaRow}>
        <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
          <AppText variant="caption" color={colors.textSecondary}>
            ⏱️ {currentTopic.estimated_minutes} min read
          </AppText>
        </View>
        
        {/* Interactive Narrator Control */}
        <View style={styles.narratorControl}>
          <AppText variant="caption" color={colors.textSecondary} style={{ marginRight: 6 }}>
            {isNarrating ? 'Reading Aloud...' : 'Read Aloud'}
          </AppText>
          <VoiceInput
            isRecording={isNarrating}
            onPress={() => setIsNarrating(!isNarrating)}
          />
        </View>
      </View>

      {/* 1. The Hook (Story bubble representation) */}
      <View style={styles.tutorContainer}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
          <AppText variant="heading2" color={colors.primary}>V</AppText>
        </View>
        <TutorBubble message={resolvedStory} style={styles.bubble} />
      </View>

      {/* Narrating Subtitle simulation widget */}
      {isNarrating && (
        <Card style={[styles.subCard, { borderColor: colors.primary }]}>
          <LoadingDots color={colors.primary} size={8} />
          <AppText variant="bodyLg" style={styles.narrationSubtitle}>
            "{resolvedStory}"
          </AppText>
        </Card>
      )}

      {/* 2. Concept Explanation */}
      <Card style={styles.card}>
        <AppText variant="heading2" style={styles.sectionTitle} color={colors.primary}>
          📚 What's Going On?
        </AppText>
        <AppText variant="bodyLg" color={colors.textPrimary} style={styles.bodyText}>
          {conceptText}
        </AppText>
      </Card>

      {/* 3. Diagram Viewer (Visual explanation) */}
      <View style={styles.diagramContainer}>
        <DiagramViewer
          source="https://picsum.photos/seed/math/360/240"
          caption="Visualizing Addition of Unlike Fractions (1/3 + 1/4)"
          description="A circle split into three equal portions represents 1/3. Another circle split into four equal portions represents 1/4. We divide both into 12 equal sections to combine them as 4/12 and 3/12, making 7/12 total."
        />
      </View>

      {/* 4. Worked Example */}
      <Card style={styles.card}>
        <AppText variant="heading2" style={styles.sectionTitle} color={colors.primary}>
          📝 Step-by-Step Example
        </AppText>
        
        <View style={[styles.problemBox, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
          <AppText variant="heading1" style={styles.problemText}>
            {currentTopic.worked_example.problem}
          </AppText>
        </View>

        <View style={styles.stepsBox}>
          {stepsList.map((step: string, i: number) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <AppText variant="bodyLg" style={styles.stepText}>
                {step}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      {/* 5. Key Points */}
      <Card style={styles.card}>
        <AppText variant="heading2" style={styles.sectionTitle} color={colors.primary}>
          💡 Key Reminders
        </AppText>
        <View style={styles.stepsBox}>
          {keyPointsList.map((point: string, i: number) => (
            <View key={i} style={styles.stepRow}>
              <AppText variant="heading2" style={{ marginRight: 6 }}>⭐</AppText>
              <AppText variant="bodyLg" style={styles.stepText}>
                {point}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      {/* 6. Quiz CTA section */}
      <Card style={[styles.ctaCard, { backgroundColor: colors.primarySubtle }]}>
        <AppText variant="heading1" style={styles.ctaTitle} color={colors.primary}>
          Ready for a Challenge? 🧠
        </AppText>
        <AppText variant="bodyLg" color={colors.textSecondary} style={styles.ctaDesc}>
          Let's test what you just learned with a fun, short quiz!
        </AppText>
        <Button
          title="Take the Quiz!"
          onPress={() => router.push({
            pathname: '/(home)/quiz/[topicId]',
            params: { topicId }
          })}
          style={styles.ctaBtn}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  narratorControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    flex: 1,
  },
  subCard: {
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 10,
  },
  narrationSubtitle: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  card: {
    padding: 18,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  bodyText: {
    lineHeight: 26,
  },
  diagramContainer: {
    width: '100%',
  },
  problemBox: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  problemText: {
    fontWeight: '800',
    fontSize: 28,
  },
  stepsBox: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    marginRight: 10,
  },
  stepText: {
    flex: 1,
    lineHeight: 24,
  },
  ctaCard: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  ctaTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  ctaDesc: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  ctaBtn: {
    width: '100%',
  },
});
