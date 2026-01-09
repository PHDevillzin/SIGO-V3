require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    const client = await pool.connect();
    try {
        console.log("Checking Schema...");

        const res1 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_access' AND column_name = 'instituicao'");
        console.log(`user_access.instituicao: ${res1.rows.length > 0 ? 'EXISTS' : 'MISSING'}`);

        const res2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'status'");
        console.log(`units.status: ${res2.rows.length > 0 ? 'EXISTS' : 'MISSING'}`);

    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
