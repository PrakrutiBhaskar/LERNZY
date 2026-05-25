export const migration001 = `
-- students table
CREATE TABLE IF NOT EXISTS students (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT    NOT NULL,
  grade             INTEGER NOT NULL CHECK (grade IN (6, 7, 8)),
  language          TEXT    NOT NULL CHECK (language IN ('en', 'hi', 'kn')),
  interests_json    TEXT    NOT NULL DEFAULT '[]',
  learning_style    TEXT    NOT NULL DEFAULT 'mixed' CHECK (learning_style IN ('stories', 'diagrams', 'mixed')),
  state_board       TEXT    NOT NULL DEFAULT 'karnataka',
  onboarding_done   INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject           TEXT    NOT NULL,
  chapter_id        TEXT    NOT NULL,
  topic_id          TEXT    NOT NULL,
  mode              TEXT    NOT NULL CHECK (mode IN ('lesson','quiz','flashcard','revision','freeask')),
  started_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  ended_at          TEXT,
  duration_seconds  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_topic   ON sessions(student_id, topic_id);

-- quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id          TEXT    NOT NULL,
  score             INTEGER NOT NULL,
  total             INTEGER NOT NULL,
  difficulty_level  TEXT    NOT NULL DEFAULT 'mixed' CHECK (difficulty_level IN ('easy','medium','hard','mixed')),
  attempted_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_student_topic ON quiz_results(student_id, topic_id);

-- achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_key         TEXT    NOT NULL,
  earned_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (student_id, badge_key)
);
`;
