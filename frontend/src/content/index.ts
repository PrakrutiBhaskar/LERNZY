import { ContentNotFoundError } from '../utils/errors';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface LessonChapter {
  id: string;
  subject: string;
  title: string;
  introduction: string;
  body: string;
  summary: string;
  quiz: QuizQuestion[];
}

/**
 * Offline content reader scaffold.
 * Reads lesson chapters and quizzes from local asset bundle files or caches.
 */
export async function loadLessonContent(
  subject: string,
  chapterId: string
): Promise<LessonChapter> {
  // Placeholder/Scaffold - raises error if file missing
  const contentPath = `assets/content/${subject}/${chapterId}.json`;
  
  throw new ContentNotFoundError(
    `Lesson chapter '${chapterId}' not found for subject '${subject}'.`,
    contentPath
  );
}
