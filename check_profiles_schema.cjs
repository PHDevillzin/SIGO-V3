require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    const client = await pool.connect();
    try {
        console.log("Checking PROFILES Schema...");
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles'");
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
