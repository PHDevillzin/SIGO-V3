
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Testing database connection to:', process.env.DATABASE_URL?.split('@')[1]); // Log host only for privacy
    const client = await pool.connect();
    console.log('Connected to client!');
    const result = await client.query('SELECT NOW() as now');
    console.log('Query result:', result.rows[0]);
    client.release();
    await pool.end();
    console.log('Connection successful!');
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
