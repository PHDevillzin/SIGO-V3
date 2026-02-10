import pg from 'pg';

// Safe global for the pool to support serverless cold starts caching
let pool: pg.Pool | null = null;

const getPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      console.error("CRITICAL: DATABASE_URL environment variable is MISSING.");
      throw new Error("DATABASE_URL environment variable is missing");
    }
    
    // Use the pattern explicitly verified in health-db.ts
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
};

export const query = async (text: string, params?: any[]) => {
  try {
    const p = getPool();
    const res = await p.query(text, params);
    return res;
  } catch (err) {
    console.error('Database connection error in query:', err);
    throw err;
  }
};
