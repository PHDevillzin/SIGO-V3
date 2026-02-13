
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function listProfileNames() {
    try {
        const res = await pool.query('SELECT name FROM profiles');
        console.log("Profile Names:", res.rows.map(r => r.name));
    } catch (err) {
        console.error("Error listing profiles:", err);
    } finally {
        pool.end();
    }
}

listProfileNames();
