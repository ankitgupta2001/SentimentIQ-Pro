import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          tier TEXT NOT NULL DEFAULT 'standard',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating users table:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Users table ready');
      });

      // Analysis history table
      db.run(`
        CREATE TABLE IF NOT EXISTS analysis_history (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          text TEXT NOT NULL,
          features TEXT NOT NULL,
          result TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating analysis_history table:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Analysis history table ready');
        resolve();
      });
    });
  });
};

// User operations
export const userOperations = {
  create: (user) => {
    return new Promise((resolve, reject) => {
      const { id, email, name, passwordHash, tier } = user;
      db.run(
        'INSERT INTO users (id, email, name, password_hash, tier) VALUES (?, ?, ?, ?, ?)',
        [id, email, name, passwordHash, tier],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, email, name, tier, createdAt: new Date().toISOString() });
          }
        }
      );
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, name, tier, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
};

// Analysis history operations
export const analysisOperations = {
  create: (analysis) => {
    return new Promise((resolve, reject) => {
      const { id, userId, text, features, result } = analysis;
      db.run(
        'INSERT INTO analysis_history (id, user_id, text, features, result) VALUES (?, ?, ?, ?, ?)',
        [id, userId, text, JSON.stringify(features), JSON.stringify(result)],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, userId, text, features, result, createdAt: new Date().toISOString() });
          }
        }
      );
    });
  },

  findByUserId: (userId, limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM analysis_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const analyses = rows.map(row => ({
              ...row,
              features: JSON.parse(row.features),
              result: JSON.parse(row.result)
            }));
            resolve(analyses);
          }
        }
      );
    });
  },

  deleteByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM analysis_history WHERE user_id = ?',
        [userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }
};

// Initialize database on startup
initializeDatabase().catch(console.error);

export default db;