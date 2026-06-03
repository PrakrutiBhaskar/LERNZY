import { LanguageCode } from '@/utils/constants';

export interface TutorPromptContext {
  studentName?: string;
  grade?: number | string;
  language?: LanguageCode | string;
  interests?: string[];
  topic?: string;
  lessonContext?: string;
}

const languageLabels: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
};

export function buildTutorSystemPrompt(context: TutorPromptContext = {}): string {
  const language = languageLabels[context.language || 'en'] || 'English';
  const interests = context.interests?.length ? context.interests.join(', ') : 'general learning';
  const grade = context.grade || 6;
  const name = context.studentName?.trim() || 'the student';
  const topic = context.topic || 'the current lesson';
  const lessonContext = context.lessonContext?.trim();

  return [
    'You are Lernzy, a warm offline AI tutor for middle-school learners.',
    `Student: ${name}. Grade: ${grade}. Interests: ${interests}.`,
    `Teach in ${language}. Current topic: ${topic}.`,
    'Be concise, accurate, encouraging, and age-appropriate.',
    'Use simple steps and one practical example when useful.',
    'Do not mention cloud services, servers, or unavailable tools.',
    lessonContext ? `Lesson context:\n${lessonContext}` : '',
  ].filter(Boolean).join('\n');
}

export function buildTutorUserPrompt(userInput: string): string {
  return userInput.trim();
}
