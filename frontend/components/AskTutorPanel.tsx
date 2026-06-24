import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/theme';
import { LanguageCode } from '@/utils/constants';
import { streamTutorResponseSSE, TutorMessage } from '@/ai/tutor';
import { AppText } from './AppText';
import { Card } from './Card';
import { InputField } from './InputField';
import { TutorBubble } from './TutorBubble';
import { LoadingDots } from './LoadingDots';

export interface AskTutorPanelProps {
  topic: string;
  grade?: number;
  language?: LanguageCode | string;
  studentName?: string;
  interests?: string[];
  lessonContext?: string;
}

/**
 * Lets a student type a question about the current lesson and get a response
 * from the AI tutor. Uses `streamTutorResponseSSE`, which streams from the
 * cloud when the student is signed in and otherwise falls back to the
 * on-device llama.rn model automatically (see src/ai/tutor.ts).
 */
export const AskTutorPanel: React.FC<AskTutorPanelProps> = ({
  topic,
  grade,
  language = 'en',
  studentName,
  interests,
  lessonContext,
}) => {
  const { colors } = useTheme();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;

    setErrorText(null);
    setQuestion('');

    const studentMessage: TutorMessage = {
      role: 'student',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    const historyForCall = [...messages, studentMessage];
    setMessages(historyForCall);
    setStreamingText('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamTutorResponseSSE(
      trimmed,
      {
        topic,
        grade,
        language: typeof language === 'string' ? language : undefined,
        abortSignal: controller.signal,
      },
      {
        onToken: (token: string) => {
          if (!isMountedRef.current) return;
          setStreamingText((prev) => prev + token);
        },
        onDone: (data: { explanation: string }) => {
          if (!isMountedRef.current) return;
          const finalText = data?.explanation?.trim() || streamingText.trim();
          setMessages((prev) => [
            ...prev,
            {
              role: 'tutor',
              text: finalText || "I couldn't come up with an answer that time, try asking again!",
              timestamp: new Date().toISOString(),
            },
          ]);
          setStreamingText('');
          setIsStreaming(false);
        },
        onError: (err: Error) => {
          if (!isMountedRef.current) return;
          console.warn('[AskTutorPanel] Tutor stream error:', err.message);
          setErrorText("Couldn't reach the tutor. Please check your connection or try again.");
          setStreamingText('');
          setIsStreaming(false);
        },
      }
    );
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Sparkles size={20} color={colors.primary} />
        <AppText variant="heading2" style={styles.title} color={colors.primary}>
          Ask Your Tutor
        </AppText>
      </View>
      <AppText variant="bodySm" color={colors.textSecondary} style={styles.subtitle}>
        Stuck on something in this lesson? Ask a question and your offline tutor will help.
      </AppText>

      {messages.length > 0 && (
        <View style={styles.history}>
          {messages.map((message, i) => (
            <View
              key={`${message.timestamp}-${i}`}
              style={message.role === 'student' ? styles.studentRow : styles.tutorRow}
            >
              {message.role === 'student' ? (
                <View style={[styles.studentBubble, { backgroundColor: colors.primary }]}>
                  <AppText variant="bodyLg" color={colors.textOnPrimary}>
                    {message.text}
                  </AppText>
                </View>
              ) : (
                <TutorBubble message={message.text} style={styles.bubble} />
              )}
            </View>
          ))}
        </View>
      )}

      {isStreaming && (
        <View style={styles.tutorRow}>
          {streamingText ? (
            <TutorBubble message={streamingText} style={styles.bubble} />
          ) : (
            <View style={[styles.bubble, styles.thinkingBubble, { backgroundColor: colors.tutorBubble }]}>
              <LoadingDots color={colors.primary} size={6} />
            </View>
          )}
        </View>
      )}

      {errorText && (
        <AppText variant="bodySm" color={colors.error} style={styles.errorText}>
          {errorText}
        </AppText>
      )}

      <View style={styles.inputRow}>
        <InputField
          value={question}
          onChangeText={setQuestion}
          placeholder="Type your question..."
          containerStyle={styles.inputContainer}
          editable={!isStreaming}
          multiline
          onSubmitEditing={handleAsk}
        />
        <Pressable
          onPress={isStreaming ? handleStop : handleAsk}
          disabled={!isStreaming && !question.trim()}
          accessibilityRole="button"
          accessibilityLabel={isStreaming ? 'Stop tutor response' : 'Ask the tutor'}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: isStreaming
                ? colors.error
                : question.trim()
                ? colors.primary
                : colors.surfaceAlt,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Send size={20} color={isStreaming || question.trim() ? colors.textOnPrimary : colors.textDisabled} />
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: -6,
  },
  history: {
    gap: 12,
  },
  studentRow: {
    alignItems: 'flex-end',
  },
  tutorRow: {
    alignItems: 'flex-start',
  },
  studentBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubble: {
    maxWidth: '85%',
  },
  thinkingBubble: {
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});