require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addIsActive() {
    const client = await pool.connect();
    try {
        console.log("Checking users table for is_active column...");

        const res = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active'"
        );

        if (res.rows.length === 0) {
            console.log("Adding is_active column...");
            await client.query("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
            console.log("Column added.");
        } else {
            console.log("Column is_active already exists.");
        }

    } catch (err) {
        console.error('Error migrating users table:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

addIsActive();
