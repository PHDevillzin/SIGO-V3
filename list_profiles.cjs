require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function listProfiles() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT id, name, category FROM profiles ORDER BY name');
        res.rows.forEach(r => {
            console.log(`ID: ${r.id} | Name: "${r.name}" | Category: ${r.category}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

listProfiles();
