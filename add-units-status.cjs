require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addStatusToUnits() {
    const client = await pool.connect();
    try {
        console.log('Adding status column to units...');
        await client.query(`ALTER TABLE units ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;`);
        console.log('Column added successfully.');
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

addStatusToUnits();
