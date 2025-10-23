import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory:', dataDir);
}

const dbPath = join(dataDir, 'goalsheet.db');

// Initialize database
let db;
try {
  db = new Database(dbPath);
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  console.log('📁 Database connected:', dbPath);
} catch (error) {
  console.error('❌ Database connection error:', error);
  throw error;
}

// Create a PostgreSQL-compatible query interface
const pool = {
  query: async (text, params = []) => {
    // Convert PostgreSQL $1, $2 placeholders to SQLite ? placeholders
    const sqliteQuery = text.replace(/\$(\d+)/g, '?');

    try {
      // Detect query type
      if (sqliteQuery.trim().toUpperCase().startsWith('SELECT') ||
          sqliteQuery.trim().toUpperCase().startsWith('WITH')) {
        const stmt = db.prepare(sqliteQuery);
        const rows = stmt.all(...params);
        return { rows };
      } else if (sqliteQuery.trim().toUpperCase().startsWith('INSERT') ||
                 sqliteQuery.trim().toUpperCase().startsWith('UPDATE') ||
                 sqliteQuery.trim().toUpperCase().startsWith('DELETE')) {
        const stmt = db.prepare(sqliteQuery);
        const info = stmt.run(...params);
        // Return row with id for INSERT with RETURNING clause
        if (sqliteQuery.includes('RETURNING')) {
          const lastId = info.lastInsertRowid;
          return { rows: [{ id: lastId }] };
        }
        return { rows: [], rowCount: info.changes };
      } else {
        // For other queries (CREATE, DROP, etc.)
        db.exec(sqliteQuery);
        return { rows: [] };
      }
    } catch (error) {
      console.error('Query error:', error);
      console.error('Query:', sqliteQuery);
      console.error('Params:', params);
      throw error;
    }
  }
};

// Export pool as default for routes, and db for migrations
export default pool;
export { db };
