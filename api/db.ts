import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');

// Log to confirm file is loading (helps debug Vercel logs)
console.log('[DB] Initializing db.ts with createRequire...');

// Safe global for the pool
let pool: any = null;

const getPool = () => {
  if (!pool) {
    console.log('[DB] Connecting to pool...');
    if (!process.env.DATABASE_URL) {
      const errorMsg = "CRITICAL: DATABASE_URL environment variable is MISSING.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Create new pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Error handling for the idle pool
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
};

export const query = async (text: string, params?: any[]) => {
  try {
    const p = getPool();
    const start = Date.now();
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Database connection error in query:', err);
    throw err;
  }
};
