import { ensureLocalStudent, LocalStudentProfile } from '@/db/database';
import { LanguageCode, STORAGE_KEYS } from '@/utils/constants';
import { getObject, setBoolean, setObject } from '@/utils/storage';

export type LearningStyleId = 'reading' | 'audio' | 'quiz' | 'visual' | 'story' | 'exam' | 'interactive' | 'mixed';

export interface StudentOnboardingProfile extends LocalStudentProfile {
  name: string;
  grade: number;
  language: LanguageCode;
  interests: string[];
  learningStyle: LearningStyleId;
  onboardingDone?: boolean;
}

const DEFAULT_PROFILE: StudentOnboardingProfile = {
  name: '',
  grade: 6,
  language: 'en',
  interests: [],
  learningStyle: 'mixed',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanLanguage(value: unknown): LanguageCode {
  return value === 'hi' || value === 'kn' ? value : 'en';
}

function cleanGrade(value: unknown): number {
  const parsed = Number.parseInt(String(value || '').replace(/\D/g, ''), 10);
  return [6, 7, 8].includes(parsed) ? parsed : DEFAULT_PROFILE.grade;
}

function cleanLearningStyle(value: unknown): LearningStyleId {
  return value === 'reading' || value === 'audio' || value === 'quiz' || value === 'visual' || value === 'story' || value === 'exam' || value === 'interactive'
    ? value as LearningStyleId
    : DEFAULT_PROFILE.learningStyle;
}

function cleanInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function normalizeProfile(value: unknown): StudentOnboardingProfile {
  const source = isRecord(value) ? value : {};

  return {
    ...DEFAULT_PROFILE,
    name: typeof source.name === 'string' ? source.name : DEFAULT_PROFILE.name,
    grade: cleanGrade(source.grade),
    language: cleanLanguage(source.language),
    interests: cleanInterests(source.interests),
    learningStyle: cleanLearningStyle(source.learningStyle),
    onboardingDone: source.onboardingDone === true,
  };
}

export async function loadOnboardingProfile(): Promise<StudentOnboardingProfile> {
  const saved = await getObject<unknown>(STORAGE_KEYS.STUDENT_PROFILE);
  return normalizeProfile(saved);
}

export async function saveOnboardingProfile(
  updates: Partial<StudentOnboardingProfile>
): Promise<StudentOnboardingProfile> {
  const current = await loadOnboardingProfile();
  const next = normalizeProfile({ ...current, ...updates });
  await setObject(STORAGE_KEYS.STUDENT_PROFILE, next);
  return next;
}

export async function finishOnboarding(profile: Partial<StudentOnboardingProfile>): Promise<void> {
  const completed = normalizeProfile({
    ...profile,
    onboardingDone: true,
  });

  try {
    await ensureLocalStudent(completed);
  } catch (error) {
    console.warn('Local student setup failed; continuing onboarding completion.', error);
  }

  await setObject(STORAGE_KEYS.STUDENT_PROFILE, completed);
  await setBoolean(STORAGE_KEYS.MODELS_READY, true);
  await setBoolean(STORAGE_KEYS.ONBOARDING_DONE, true);
}
