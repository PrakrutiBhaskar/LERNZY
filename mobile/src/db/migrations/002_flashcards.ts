export const migration002 = `
-- flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id          TEXT    NOT NULL,
  source            TEXT    NOT NULL DEFAULT 'bundled' CHECK (source IN ('bundled', 'ai_generated')),
  front_text        TEXT    NOT NULL,
  back_text         TEXT    NOT NULL,
  memory_hook       TEXT,
  ease_factor       REAL    NOT NULL DEFAULT 2.5,
  interval_days     INTEGER NOT NULL DEFAULT 1,
  repetitions       INTEGER NOT NULL DEFAULT 0,
  next_review_at    TEXT    NOT NULL DEFAULT (date('now')),
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  last_reviewed_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_flashcards_due ON flashcards(student_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(student_id, topic_id);

-- flashcard_reviews table
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  flashcard_id      INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rating            TEXT    NOT NULL CHECK (rating IN ('easy', 'good', 'hard')),
  reviewed_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  new_interval_days INTEGER NOT NULL,
  new_ease_factor   REAL    NOT NULL
);
`;
