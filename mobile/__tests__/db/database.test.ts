import * as SQLite from 'expo-sqlite';
import { initDatabase, DB_SCHEMA_VERSION, resetInitLock } from '../../src/db/database';
import { DBError } from '../../src/utils/errors';

// A mock of expo-sqlite will be automatically applied if Jest runs in a Node environment.
// Let's write standard tests that check database setup.

describe('Database Infrastructure and Migrations', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    resetInitLock();
    // Open a new in-memory database for each test to ensure isolation
    db = SQLite.openDatabaseSync(':memory:');
  });

  afterEach(async () => {
    if (db) {
      await db.closeAsync();
    }
  });

  it('should run migrations successfully on a fresh database', async () => {
    // 1. Initialize the database
    await initDatabase(db);

    // 2. Query sqlite_master to verify that all tables are created
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    const tableNames = tables.map((t) => t.name);

    // Verify all core tables exist
    expect(tableNames).toContain('migration_tracking');
    expect(tableNames).toContain('students');
    expect(tableNames).toContain('sessions');
    expect(tableNames).toContain('quiz_results');
    expect(tableNames).toContain('achievements');
    expect(tableNames).toContain('flashcards');
    expect(tableNames).toContain('flashcard_reviews');
  });

  it('should be idempotent (running initDatabase multiple times does not fail or re-apply)', async () => {
    // 1. First initialization
    await initDatabase(db);

    // Get count of migrations
    const initialCountRow = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM migration_tracking'
    );
    expect(initialCountRow?.count).toBe(2);

    // 2. Second initialization (idempotent call)
    await expect(initDatabase(db)).resolves.not.toThrow();

    // Verify migrations count remains 2
    const finalCountRow = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM migration_tracking'
    );
    expect(finalCountRow?.count).toBe(2);
  });

  it('should track applied migrations correctly in migration_tracking table', async () => {
    await initDatabase(db);

    // Query applied migrations
    const rows = await db.getAllAsync<{ name: string; applied_at: string }>(
      'SELECT name FROM migration_tracking ORDER BY id ASC'
    );

    expect(rows.length).toBe(2);
    expect(rows[0].name).toBe('001_initial');
    expect(rows[1].name).toBe('002_flashcards');
  });

  it('should handle syntax errors gracefully and wrap them in DBError', async () => {
    // Pre-insert a migration record that will trigger a conflict, or pass a mock database that throws.
    // Here we can mock db.execAsync or force an issue.
    // Let's temporarily stub activeDb.execAsync to throw an error.
    const originalExec = db.execAsync.bind(db);
    db.execAsync = jest.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('students')) {
        throw new Error('SQL Syntax Error near CREATE TABLE');
      }
      return originalExec(sql);
    });

    await expect(initDatabase(db)).rejects.toThrow(DBError);
    await expect(initDatabase(db)).rejects.toThrow('Database initialization failed: SQL Syntax Error near CREATE TABLE');
  });

  it('should prevent concurrent initializations using a lock (calls return the same promise)', async () => {
    // 1. Trigger concurrent initializations
    const p1 = initDatabase(db);
    const p2 = initDatabase(db);

    // 2. Expect both to return the exact same Promise instance
    expect(p1).toBe(p2);

    // 3. Wait for completion
    await Promise.all([p1, p2]);

    // 4. Verify migrations were only tracked once
    const rows = await db.getAllAsync<{ name: string }>('SELECT name FROM migration_tracking');
    expect(rows.length).toBe(2);
  });
});
