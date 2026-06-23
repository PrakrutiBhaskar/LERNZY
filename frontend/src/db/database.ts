import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { DBError } from '../utils/errors';
import { migration001 } from './migrations/001_initial';
import { migration002 } from './migrations/002_flashcards';

export const DB_SCHEMA_VERSION = 2;
export const DB_NAME = 'lernzy.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function isLocalDatabaseAvailable(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return !!SQLite;
  } catch (err) {
    return false;
  }
}

import { getAuthState } from '../services/api';

const mockDb = {
  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    console.log('[Mock DB Web] runAsync:', sql, params);
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('insert into students')) {
      const name = params[0];
      const grade = params[1];
      const lang = params[2];
      const interests = params[3];
      const style = params[4];
      
      const students = JSON.parse(localStorage.getItem('lernzy_local_students') || '[]');
      const id = students.length + 1;
      students.push({ id, name, grade, language: lang, interests_json: interests, learning_style: style });
      localStorage.setItem('lernzy_local_students', JSON.stringify(students));
      return { lastInsertRowId: id, changes: 1 };
    }
    
    if (lowerSql.includes('update students')) {
      const name = params[0];
      const grade = params[1];
      const lang = params[2];
      const interests = params[3];
      const style = params[4];
      const id = params[5];
      
      const students = JSON.parse(localStorage.getItem('lernzy_local_students') || '[]');
      const student = students.find((s: any) => s.id === id);
      if (student) {
        student.name = name;
        student.grade = grade;
        student.language = lang;
        student.interests_json = interests;
        student.learning_style = style;
      }
      localStorage.setItem('lernzy_local_students', JSON.stringify(students));
      return { lastInsertRowId: id, changes: 1 };
    }
    
    if (lowerSql.includes('insert into sessions')) {
      const student_id = params[0];
      const subject = params[1];
      const chapter_id = params[2];
      const topic_id = params[3];
      const mode = params[4];
      const started_at = params[5];
      
      const sessions = JSON.parse(localStorage.getItem('lernzy_local_sessions') || '[]');
      const id = sessions.length + 1;
      sessions.push({ id, student_id, subject, chapter_id, topic_id, mode, started_at, ended_at: null, duration_seconds: null });
      localStorage.setItem('lernzy_local_sessions', JSON.stringify(sessions));
      return { lastInsertRowId: id, changes: 1 };
    }
    
    if (lowerSql.includes('update sessions')) {
      const ended_at = params[0];
      const duration = params[1];
      const id = params[2];
      
      const sessions = JSON.parse(localStorage.getItem('lernzy_local_sessions') || '[]');
      const session = sessions.find((s: any) => s.id === id);
      if (session) {
        session.ended_at = ended_at;
        session.duration_seconds = duration;
      }
      localStorage.setItem('lernzy_local_sessions', JSON.stringify(sessions));
      return { lastInsertRowId: id, changes: 1 };
    }
    
    if (lowerSql.includes('insert into quiz_results')) {
      const student_id = params[0];
      const topic_id = params[1];
      const score = params[2];
      const total = params[3];
      const diff = params[4];
      const attempted_at = params[5];
      
      const results = JSON.parse(localStorage.getItem('lernzy_local_quiz_results') || '[]');
      const id = results.length + 1;
      results.push({ id, student_id, topic_id, score, total, difficulty_level: diff, attempted_at });
      localStorage.setItem('lernzy_local_quiz_results', JSON.stringify(results));
      return { lastInsertRowId: id, changes: 1 };
    }

    if (lowerSql.includes('insert into sync_queue')) {
      const client_generated_id = params[0];
      const type = params[1];
      const module = params[2];
      const payload = params[3];
      const client_timestamp = params[4];
      const retry_count = params[5] ?? 0;

      const queue = JSON.parse(localStorage.getItem('lernzy_local_sync_queue') || '[]');
      const existing = queue.find((event: any) => event.client_generated_id === client_generated_id);
      if (existing) {
        return { lastInsertRowId: existing.id, changes: 0 };
      }

      const id = queue.length + 1;
      queue.push({ id, client_generated_id, type, module, payload, client_timestamp, retry_count });
      localStorage.setItem('lernzy_local_sync_queue', JSON.stringify(queue));
      return { lastInsertRowId: id, changes: 1 };
    }

    if (lowerSql.includes('delete from sync_queue')) {
      const clientGeneratedId = params[0];
      const queue = JSON.parse(localStorage.getItem('lernzy_local_sync_queue') || '[]');
      const nextQueue = queue.filter((event: any) => event.client_generated_id !== clientGeneratedId);
      localStorage.setItem('lernzy_local_sync_queue', JSON.stringify(nextQueue));
      return { lastInsertRowId: 0, changes: queue.length - nextQueue.length };
    }

    if (lowerSql.includes('update sync_queue')) {
      const retry_count = params[0];
      const clientGeneratedId = params[1];
      const queue = JSON.parse(localStorage.getItem('lernzy_local_sync_queue') || '[]');
      const event = queue.find((item: any) => item.client_generated_id === clientGeneratedId);
      if (event) {
        event.retry_count = retry_count;
      }
      localStorage.setItem('lernzy_local_sync_queue', JSON.stringify(queue));
      return { lastInsertRowId: 0, changes: event ? 1 : 0 };
    }

    if (lowerSql.includes('insert or ignore into dead_letter_queue')) {
      const client_generated_id = params[0];
      const type = params[1];
      const module = params[2];
      const payload = params[3];
      const client_timestamp = params[4];
      const retry_count = params[5];
      const error_message = params[6];
      const created_at = params[7];

      const queue = JSON.parse(localStorage.getItem('lernzy_local_dead_letter_queue') || '[]');
      const existing = queue.find((event: any) => event.client_generated_id === client_generated_id);
      if (existing) {
        return { lastInsertRowId: existing.id, changes: 0 };
      }

      const id = queue.length + 1;
      queue.push({ id, client_generated_id, type, module, payload, client_timestamp, retry_count, error_message, created_at });
      localStorage.setItem('lernzy_local_dead_letter_queue', JSON.stringify(queue));
      return { lastInsertRowId: id, changes: 1 };
    }

    if (lowerSql.includes('insert into achievements') || lowerSql.includes('insert or ignore into achievements')) {
      const student_id = params[0];
      const badge_key = params[1];
      const earned_at = params[2] || new Date().toISOString();
      const achievements = JSON.parse(localStorage.getItem('lernzy_local_achievements') || '[]');
      const exists = achievements.some((a: any) => a.student_id === student_id && a.badge_key === badge_key);
      if (!exists) {
        achievements.push({ student_id, badge_key, earned_at });
        localStorage.setItem('lernzy_local_achievements', JSON.stringify(achievements));
      }
      return { lastInsertRowId: 1, changes: 1 };
    }

    throw new Error(`[Mock DB Web] Unsupported SQL command: ${sql}`);
  },

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    console.log('[Mock DB Web] getFirstAsync:', sql, params);
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('from students')) {
      const auth = getAuthState();
      let studentName = 'Friend';
      let studentId = 1;
      if (auth.isAuthenticated && auth.user) {
        studentName = auth.user.name || 'Friend';
        const str = auth.user.id || auth.user.email || '1';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        studentId = Math.abs(hash);
      } else {
        studentId = 999;
        studentName = 'Guest';
      }
      const students = JSON.parse(localStorage.getItem('lernzy_local_students') || '[]');
      let student = students.find((s: any) => s.id === studentId);
      if (!student) {
        student = { id: studentId, name: studentName, grade: 6, language: 'en', interests_json: '[]', learning_style: 'mixed' };
        students.push(student);
        localStorage.setItem('lernzy_local_students', JSON.stringify(students));
      }
      return student as unknown as T;
    }
    
    if (lowerSql.includes('from sessions')) {
      const sessions = JSON.parse(localStorage.getItem('lernzy_local_sessions') || '[]');
      
      if (lowerSql.includes('order by started_at desc limit 1')) {
        const studentId = params[0];
        const studentSessions = sessions.filter((s: any) => s.student_id === studentId);
        if (studentSessions.length === 0) return null;
        return studentSessions[studentSessions.length - 1] as unknown as T;
      }
      
      if (lowerSql.includes('mode = \'lesson\' and ended_at is not null')) {
        const studentId = params[0];
        const topicId = params[1];
        const match = sessions.find((s: any) => s.student_id === studentId && s.topic_id === topicId && s.mode === 'lesson' && s.ended_at);
        return match ? match : null;
      }
    }
    
    if (lowerSql.includes('from quiz_results')) {
      const results = JSON.parse(localStorage.getItem('lernzy_local_quiz_results') || '[]');
      const studentId = params[0];
      const topicId = params[1];
      const match = results.find((r: any) => r.student_id === studentId && r.topic_id === topicId);
      return match ? match : null;
    }
    
    throw new Error(`[Mock DB Web] Unsupported SQL query (getFirstAsync): ${sql}`);
  },

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    console.log('[Mock DB Web] getAllAsync:', sql, params);
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('from sessions') && lowerSql.includes('union') && lowerSql.includes('from quiz_results')) {
      const studentId = params[0];
      const sessions = JSON.parse(localStorage.getItem('lernzy_local_sessions') || '[]');
      const results = JSON.parse(localStorage.getItem('lernzy_local_quiz_results') || '[]');
      
      const compSet = new Set<string>();
      sessions.forEach((s: any) => {
        if (s.student_id === studentId && s.ended_at) {
          compSet.add(s.topic_id);
        }
      });
      results.forEach((r: any) => {
        if (r.student_id === studentId) {
          compSet.add(r.topic_id);
        }
      });
      
      return Array.from(compSet).map(topic_id => ({ topic_id } as unknown as T));
    }
    
    if (lowerSql.includes('from quiz_results')) {
      const results = JSON.parse(localStorage.getItem('lernzy_local_quiz_results') || '[]');
      const studentId = params[0];
      return results.filter((r: any) => r.student_id === studentId) as unknown as T[];
    }
    
    if (lowerSql.includes('from sessions')) {
      const sessions = JSON.parse(localStorage.getItem('lernzy_local_sessions') || '[]');
      const studentId = params[0];
      return sessions.filter((s: any) => s.student_id === studentId) as unknown as T[];
    }
    
    if (lowerSql.includes('from achievements')) {
      const achievements = JSON.parse(localStorage.getItem('lernzy_local_achievements') || '[]');
      const studentId = params[0];
      return achievements.filter((a: any) => a.student_id === studentId) as unknown as T[];
    }

    if (lowerSql.includes('from sync_queue')) {
      const queue = JSON.parse(localStorage.getItem('lernzy_local_sync_queue') || '[]');
      return queue
        .slice()
        .sort((a: any, b: any) => Number(a.client_timestamp) - Number(b.client_timestamp))
        .slice(0, 20) as unknown as T[];
    }
    
    throw new Error(`[Mock DB Web] Unsupported SQL query (getAllAsync): ${sql}`);
  },

  async execAsync(sql: string): Promise<void> {
    console.log('[Mock DB Web] execAsync:', sql);
  },

  async withTransactionAsync(callback: () => Promise<void>): Promise<void> {
    await callback();
  }
};

/**
 * Gets the current active SQLite database connection.
 * Lazily opens a connection if it does not already exist.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!isLocalDatabaseAvailable()) {
    return mockDb as unknown as SQLite.SQLiteDatabase;
  }

  try {
    if (!dbInstance) {
      dbInstance = SQLite.openDatabaseSync(DB_NAME);
    }
    return dbInstance;
  } catch (err) {
    console.warn('[DB] Failed to open SQLite database, falling back to mock:', err);
    return mockDb as unknown as SQLite.SQLiteDatabase;
  }
}

/**
 * Sets or injects a specific database connection (primarily used for unit testing with :memory:).
 */
export function setDb(testDb: SQLite.SQLiteDatabase): void {
  dbInstance = testDb;
}

let initPromise: Promise<void> | null = null;

/**
 * Helper to reset the database initialization lock (primarily used for unit testing).
 */
export function resetInitLock(): void {
  initPromise = null;
}

export interface LocalStudentProfile {
  name?: string;
  grade?: number | string;
  language?: string;
  interests?: string[];
  learningStyle?: string;
}

function normalizeGrade(grade: LocalStudentProfile['grade']): number {
  const parsed = Number.parseInt(String(grade || '').replace(/\D/g, ''), 10);
  return [6, 7, 8].includes(parsed) ? parsed : 6;
}

function normalizeLanguage(language: LocalStudentProfile['language']): string {
  return language === 'hi' || language === 'kn' ? language : 'en';
}

function normalizeLearningStyle(style: LocalStudentProfile['learningStyle']): string {
  if (style === 'reading' || style === 'audio' || style === 'quiz') {
    return style;
  }
  if (style === 'visual') return 'reading';
  if (style === 'story') return 'audio';
  if (style === 'exam') return 'reading';
  if (style === 'interactive') return 'quiz';
  return 'mixed';
}

/**
 * Ensures local progress tables have a student row to reference.
 */
export async function ensureLocalStudent(profile: LocalStudentProfile = {}): Promise<number> {
  if (!isLocalDatabaseAvailable()) {
    const auth = getAuthState();
    if (auth.isAuthenticated && auth.user) {
      const str = auth.user.id || auth.user.email || '1';
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    }
    return 999;
  }

  const db = getDb();
  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM students ORDER BY id LIMIT 1');
  const name = profile.name?.trim() || 'Friend';
  const grade = normalizeGrade(profile.grade);
  const language = normalizeLanguage(profile.language);
  const interestsJson = JSON.stringify(profile.interests || []);
  const learningStyle = normalizeLearningStyle(profile.learningStyle);

  if (existing) {
    await db.runAsync(
      `UPDATE students
       SET name = ?, grade = ?, language = ?, interests_json = ?, learning_style = ?,
           onboarding_done = 1, updated_at = datetime('now')
       WHERE id = ?`,
      [name, grade, language, interestsJson, learningStyle, existing.id]
    );
    return existing.id;
  }

  const result = await db.runAsync(
    `INSERT INTO students (name, grade, language, interests_json, learning_style, onboarding_done)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [name, grade, language, interestsJson, learningStyle]
  );

  return result.lastInsertRowId;
}

/**
 * Initializes the SQLite database.
 * Sets mandatory pragmas, sets up the migration tracking table, and runs pending migrations in order.
 * Uses a promise lock to prevent concurrent initialization runs.
 */
export function initDatabase(db?: SQLite.SQLiteDatabase): Promise<void> {
  if (!isLocalDatabaseAvailable()) {
    return Promise.resolve();
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const activeDb = db || getDb();
    if (db) {
      setDb(db);
    }

    try {
      // 1. Apply core SQLite performance and safety pragmas (non-transactional)
      await activeDb.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;
      `);

      // 2. Setup the migration tracking table if not present
      await activeDb.execAsync(`
        CREATE TABLE IF NOT EXISTS migration_tracking (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // 3. Define and run migrations in order
      const migrations = [
        { name: '001_initial', sql: migration001 },
        { name: '002_flashcards', sql: migration002 }
      ];

      await activeDb.withTransactionAsync(async () => {
        for (const m of migrations) {
          // Query if migration has already been run
          const row = await activeDb.getFirstAsync<{ id: number }>(
            'SELECT id FROM migration_tracking WHERE name = ?',
            [m.name]
          );

          if (!row) {
            // Execute migration statements
            await activeDb.execAsync(m.sql);

            // Track that the migration completed successfully
            await activeDb.runAsync(
              'INSERT INTO migration_tracking (name) VALUES (?)',
              [m.name]
            );
          }
        }
      });
    } catch (error: any) {
      // Clear the lock so that subsequent attempts can retry
      initPromise = null;
      throw new DBError(
        `Database initialization failed: ${error.message || error}`,
        error
      );
    }
  })();

  return initPromise;
}

