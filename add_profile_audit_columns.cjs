require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log("Adding audit columns to profiles...");
        await client.query(`
            ALTER TABLE profiles
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255),
            ADD COLUMN IF NOT EXISTS last_action VARCHAR(50);
        `);
        console.log("Columns added successfully.");
    } catch (err) {
        console.error('Error migrating:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
