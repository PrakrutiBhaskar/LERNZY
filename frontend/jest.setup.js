jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: () => ({
      downloadAsync: async () => {},
      localUri: '',
    }),
  },
}));

jest.mock('expo-sqlite', () => {
  const Database = require('better-sqlite3');

  class MockSQLiteDatabase {
    constructor(filename) {
      this.db = new Database(filename === ':memory:' ? ':memory:' : filename);
    }

    async execAsync(sql) {
      this.db.exec(sql);
    }

    async getFirstAsync(sql, params = []) {
      const stmt = this.db.prepare(sql);
      const args = Array.isArray(params) ? params : [params];
      const result = stmt.get(...args);
      return result || null;
    }

    async runAsync(sql, params = []) {
      const stmt = this.db.prepare(sql);
      const args = Array.isArray(params) ? params : [params];
      const info = stmt.run(...args);
      return {
        lastInsertRowId: Number(info.lastInsertRowid),
        changes: info.changes,
      };
    }

    async getAllAsync(sql, params = []) {
      const stmt = this.db.prepare(sql);
      const args = Array.isArray(params) ? params : [params];
      return stmt.all(...args);
    }

    async withTransactionAsync(callback) {
      this.db.exec('BEGIN TRANSACTION;');
      try {
        await callback();
        this.db.exec('COMMIT;');
      } catch (error) {
        this.db.exec('ROLLBACK;');
        throw error;
      }
    }

    async closeAsync() {
      this.db.close();
    }
  }

  return {
    openDatabaseSync: (filename) => {
      return new MockSQLiteDatabase(filename);
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

