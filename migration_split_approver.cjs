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
    console.log('Starting Migration: Splitting Approver/Requester Columns...');
    const client = await pool.connect();
    try {
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_requester_sede BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_requester_strategic BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_approver_sede BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_approver_strategic BOOLEAN DEFAULT FALSE;
        `);
        console.log('Columns added successfully.');
        
        // Optional: Migrate existing data if needed (e.g. map is_requester to is_requester_sede or similar)
        // For now, assuming fresh assignment via UI is preferred as the roles are distinct.
        
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
