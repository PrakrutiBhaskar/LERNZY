# Database Schema — SQLite (On-Device)
> Complete schema for the Vidya Tutor local SQLite database.
> All student data lives exclusively on the device — nothing is synced to any server.
> File: managed by `src/db/database.ts` using `expo-sqlite` or `react-native-sqlite-storage`.

---

## Migration Files

```
src/db/migrations/
  001_initial.sql      ← students, sessions, quiz_results, achievements
  002_flashcards.sql   ← flashcards table + SM-2 columns
```

Run migrations in order on every app launch. Each migration is idempotent (uses `IF NOT EXISTS`).

---

## Migration 001 — Initial Schema

```sql
-- ─────────────────────────────────────────────
-- students
-- One row per student. v1 supports a single student per device.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT    NOT NULL,
  grade             INTEGER NOT NULL CHECK (grade IN (6, 7, 8)),
  language          TEXT    NOT NULL CHECK (language IN ('en', 'hi', 'kn')),
  interests_json    TEXT    NOT NULL DEFAULT '[]',   -- JSON array e.g. '["cricket","drawing"]'
  learning_style    TEXT    NOT NULL DEFAULT 'mixed'
                            CHECK (learning_style IN ('stories', 'diagrams', 'mixed')),
  state_board       TEXT    NOT NULL DEFAULT 'karnataka',
  onboarding_done   INTEGER NOT NULL DEFAULT 0,      -- 0 = false, 1 = true
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────
-- sessions
-- One row per learning session (a student opening a topic screen).
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject           TEXT    NOT NULL,   -- e.g. 'mathematics'
  chapter_id        TEXT    NOT NULL,   -- e.g. 'ch03_fractions_decimals'
  topic_id          TEXT    NOT NULL,   -- e.g. 'addition_unlike_fractions'
  mode              TEXT    NOT NULL CHECK (mode IN ('lesson','quiz','flashcard','revision','freeask')),
  started_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  ended_at          TEXT,               -- NULL while session is active
  duration_seconds  INTEGER             -- filled when ended_at is set
);

CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_topic   ON sessions(student_id, topic_id);

-- ─────────────────────────────────────────────
-- quiz_results
-- One row per completed quiz attempt on a topic.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id          TEXT    NOT NULL,
  score             INTEGER NOT NULL,   -- number of correct answers
  total             INTEGER NOT NULL,   -- total questions attempted
  difficulty_level  TEXT    NOT NULL DEFAULT 'mixed'
                            CHECK (difficulty_level IN ('easy','medium','hard','mixed')),
  attempted_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_student_topic
  ON quiz_results(student_id, topic_id);

-- ─────────────────────────────────────────────
-- achievements
-- Badges earned by the student.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_key         TEXT    NOT NULL,   -- e.g. 'first_quiz', 'week_streak_3'
  earned_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (student_id, badge_key)        -- each badge earned only once
);
```

---

## Migration 002 — Flashcards

```sql
-- ─────────────────────────────────────────────
-- flashcards
-- SM-2 spaced repetition cards per student.
-- Cards can be seeded from flashcards.json (bundled) or AI-generated.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcards (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id          TEXT    NOT NULL,
  source            TEXT    NOT NULL DEFAULT 'bundled'
                            CHECK (source IN ('bundled', 'ai_generated')),

  -- Card content (stored in student's preferred language at creation time)
  front_text        TEXT    NOT NULL,
  back_text         TEXT    NOT NULL,
  memory_hook       TEXT,               -- optional mnemonic hint

  -- SM-2 scheduling fields
  ease_factor       REAL    NOT NULL DEFAULT 2.5,    -- EF, min 1.3
  interval_days     INTEGER NOT NULL DEFAULT 1,      -- days until next review
  repetitions       INTEGER NOT NULL DEFAULT 0,      -- consecutive correct reviews
  next_review_at    TEXT    NOT NULL DEFAULT (date('now')),   -- ISO date

  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  last_reviewed_at  TEXT                             -- NULL until first review
);

CREATE INDEX IF NOT EXISTS idx_flashcards_due
  ON flashcards(student_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_flashcards_topic
  ON flashcards(student_id, topic_id);

-- ─────────────────────────────────────────────
-- flashcard_reviews
-- Audit log of every individual review action.
-- Used for analytics and debugging SM-2 scheduling.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  flashcard_id      INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rating            TEXT    NOT NULL CHECK (rating IN ('easy', 'good', 'hard')),
  reviewed_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  new_interval_days INTEGER NOT NULL,   -- interval assigned after this review
  new_ease_factor   REAL    NOT NULL    -- EF after this review
);
```

---

## Table Summary

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `students` | Student profile (1 per device in v1) | `name`, `grade`, `language`, `interests_json` |
| `sessions` | Each topic interaction | `subject`, `topic_id`, `mode`, `started_at` |
| `quiz_results` | Quiz attempt outcomes | `score`, `total`, `topic_id` |
| `achievements` | Earned badges | `badge_key`, `earned_at` |
| `flashcards` | Cards with SM-2 state | `ease_factor`, `interval_days`, `next_review_at` |
| `flashcard_reviews` | Review history audit | `rating`, `new_interval_days` |

---

## Helper Queries

### Get due flashcards for today
```sql
SELECT * FROM flashcards
WHERE student_id = ?
  AND date(next_review_at) <= date('now')
ORDER BY next_review_at ASC
LIMIT 20;
```

### Get topic mastery (average score over last 5 quizzes)
```sql
SELECT AVG(CAST(score AS REAL) / total) AS mastery
FROM (
  SELECT score, total
  FROM quiz_results
  WHERE student_id = ? AND topic_id = ?
  ORDER BY attempted_at DESC
  LIMIT 5
);
```

### Get streak (consecutive days with at least one session)
```sql
WITH daily AS (
  SELECT DISTINCT date(started_at) AS day
  FROM sessions
  WHERE student_id = ?
  ORDER BY day DESC
)
SELECT COUNT(*) AS streak
FROM daily
WHERE julianday('now') - julianday(day) < (
  SELECT COUNT(*) FROM daily d2
  WHERE julianday(d2.day) >= julianday(daily.day)
);
-- Note: implement streak logic in application code for reliability.
```

### Recent subjects (for home screen)
```sql
SELECT subject, MAX(started_at) AS last_active
FROM sessions
WHERE student_id = ?
GROUP BY subject
ORDER BY last_active DESC
LIMIT 5;
```

---

## Data Conventions

- **Dates/times:** ISO 8601 strings (`datetime('now')` → `"2026-05-25T14:30:00"`). Always stored in UTC.
- **Booleans:** `INTEGER 0/1` (SQLite has no native BOOL).
- **JSON columns:** `interests_json` stores a JSON array as TEXT. Parse/stringify in `studentRepository.ts`.
- **Cascades:** All child tables use `ON DELETE CASCADE` so deleting a student clears all their data cleanly.
- **No NULL IDs:** All foreign keys are `NOT NULL`. Orphan rows are prevented by cascade constraints.

---

## Initialisation (`database.ts`)

```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('vidyatutor.db');

export async function initDatabase(): Promise<void> {
  await runMigration('001_initial');
  await runMigration('002_flashcards');
}

async function runMigration(name: string): Promise<void> {
  const sql = await loadAsset(`migrations/${name}.sql`);
  await db.execAsync(sql);
}
```

Call `initDatabase()` once at app startup before any repository function is used.
