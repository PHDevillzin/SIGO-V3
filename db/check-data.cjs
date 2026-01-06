require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkData() {
    const client = await pool.connect();
    try {
        const tables = ['users', 'profiles', 'units', 'tipologias', 'tipo_locais', 'requests'];
        console.log('--- Database Verification ---');
        for (const table of tables) {
            const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`${table}: ${res.rows[0].count} rows`);
        }
        console.log('-----------------------------');
    } catch (e) {
        console.error('Error verifying data:', e);
    } finally {
        client.release();
        pool.end();
    }
}

checkData();
