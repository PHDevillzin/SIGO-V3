import pkg from 'pg';
const { Pool } = pkg;

let pool: pkg.Pool | null = null;

const getPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      console.error("CRITICAL: DATABASE_URL environment variable is definition is MISSING.");
      throw new Error("DATABASE_URL environment variable is missing");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
};

export const query = (text: string, params?: any[]) => {
  try {
    const p = getPool();
    return p.query(text, params);
  } catch (err) {
    console.error('Database connection error in query:', err);
    throw err;
  }
};
