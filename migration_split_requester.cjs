const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Starting Migration: Adding Split Requester Columns...');
    const client = await pool.connect();
    try {
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_requester_sede BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_requester_strategic BOOLEAN DEFAULT FALSE;
        `);
        console.log('Columns added successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
