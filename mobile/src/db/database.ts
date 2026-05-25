import * as SQLite from 'expo-sqlite';
import { DBError } from '../utils/errors';
import { migration001 } from './migrations/001_initial';
import { migration002 } from './migrations/002_flashcards';

export const DB_SCHEMA_VERSION = 2;
export const DB_NAME = 'vidyatutor.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Gets the current active SQLite database connection.
 * Lazily opens a connection if it does not already exist.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
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

/**
 * Initializes the SQLite database.
 * Sets mandatory pragmas, sets up the migration tracking table, and runs pending migrations in order.
 * Uses a promise lock to prevent concurrent initialization runs.
 */
export function initDatabase(db?: SQLite.SQLiteDatabase): Promise<void> {
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

