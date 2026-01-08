require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Adding observacao column...');
        await client.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS observacao TEXT;`);
        console.log('Column added successfully.');
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
