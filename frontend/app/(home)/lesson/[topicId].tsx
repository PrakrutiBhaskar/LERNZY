import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { TutorBubble } from '../../components/TutorBubble';
import { ScreenContainer } from '../../components/ScreenContainer';

interface Message {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
}

export default function LessonScreen(): React.JSX.Element {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { language } = useLanguage();
  const { colors, spacing } = useTheme();

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'tutor',
      text: language === 'en'
        ? `Welcome to our lesson on ${topicId}! I'm lernzy, your offline tutor. Let's read this together.`
        : language === 'hi'
          ? `हमारे ${topicId} पाठ में आपका स्वागत है! मैं विद्या हूँ, आपकी ऑफ़लाइन ट्यूटर। आइए इसे मिलकर पढ़ें।`
          : `${topicId} ಕುರಿತ ನಮ್ಮ ಪಾಠಕ್ಕೆ ಸುಸ್ವಾಗತ! ನಾನು ವಿದ್ಯಾ, ನಿಮ್ಮ ಆಫ್‌ಲೈನ್ ಶಿಕ್ಷಕಿ. ಬನ್ನಿ ಒಟ್ಟಿಗೆ ಕಲಿಯೋಣ.`,
    },
    {
      id: '2',
      sender: 'tutor',
      text: language === 'en'
        ? "In this topic, we will explore fundamental concepts. Feel free to type questions below if you get stuck!"
        : language === 'hi'
          ? "इस विषय में, हम बुनियादी अवधारणाओं का पता लगाएंगे। यदि आप कहीं फंस जाते हैं तो नीचे अपने प्रश्न लिख सकते हैं!"
          : "ಈ ವಿಷಯದಲ್ಲಿ, ನಾವು ಮೂಲಭೂತ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಅನ್ವೇಷಿಸುತ್ತೇವೆ. ನಿಮಗೆ ಸಂಶಯವಿದ್ದರೆ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ ಕೇಳಬಹುದು!",
    },
  ]);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const studentMsg: Message = {
      id: Date.now().toString(),
      sender: 'student',
      text: inputVal.trim(),
    };

    const tutorReply: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'tutor',
      text: language === 'en'
        ? `That is a great question about ${topicId}! Since we are working offline, let me explain this simplified concept...`
        : language === 'hi'
          ? `यह ${topicId} के बारे में एक बहुत अच्छा प्रश्न है! चूंकि हम ऑफ़लाइन काम कर रहे हैं, मैं आपको इस सरल अवधारणा को समझाती हूँ...`
          : `${topicId} ಬಗ್ಗೆ ಇದು ಉತ್ತಮ ಪ್ರಶ್ನೆ! ನಾವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವುದರಿಂದ, ನಾನು ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ...`,
    };

    setMessages((prev) => [...prev, studentMsg, tutorReply]);
    setInputVal('');
  };

  return (
    <ScreenContainer
      title={language === 'en' ? 'AI Lesson Room' : language === 'hi' ? 'एआई पाठ कक्ष' : 'ಎಐ ಕಲಿಕಾ ಕೊಠಡಿ'}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={styles.container}
    >
      <View style={styles.chatArea}>
        {messages.map((msg) => {
          if (msg.sender === 'tutor') {
            return (
              <View key={msg.id} style={styles.tutorRow}>
                <View style={[styles.avatar, { backgroundColor: colors.primarySubtle }]}>
                  <AppText variant="body" color={colors.primary} style={styles.avatarLabel}>V</AppText>
                </View>
                <TutorBubble message={msg.text} style={styles.tutorBubble} />
              </View>
            );
          } else {
            return (
              <View key={msg.id} style={styles.studentRow}>
                <Card style={[styles.studentBubble, { backgroundColor: colors.primary }]}>
                  <AppText variant="bodyLg" color={colors.textOnPrimary}>
                    {msg.text}
                  </AppText>
                </Card>
              </View>
            );
          }
        })}
      </View>

      <View style={[styles.inputRow, { marginTop: spacing.space4 }]}>
        <InputField
          placeholder={language === 'en' ? 'Ask lernzy a question...' : language === 'hi' ? 'विद्या से एक प्रश्न पूछें...' : 'ವಿದ್ಯಾಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ...'}
          value={inputVal}
          onChangeText={setInputVal}
          containerStyle={styles.inputContainer}
          style={styles.textInput}
        />
        <Button
          title={language === 'en' ? 'Ask' : language === 'hi' ? 'पूछें' : 'ಕೇಳಿ'}
          onPress={handleSend}
          style={styles.sendBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flex: 1,
  },
  chatArea: {
    flex: 1,
    gap: 16,
    paddingVertical: 10,
  },
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarLabel: {
    fontWeight: '700',
  },
  tutorBubble: {
    flex: 1,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  studentBubble: {
    maxWidth: '85%',
    padding: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  textInput: {
    minHeight: 48,
  },
  sendBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
  },
});
