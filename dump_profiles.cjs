require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function listProfiles() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT id, name, category, permissions FROM profiles ORDER BY name');
        const lines = res.rows.map(r => `ID: ${r.id} | Name: "${r.name}" | Category: ${r.category}`);
        fs.writeFileSync(path.join(__dirname, 'profiles_dump.txt'), lines.join('\n'));
        console.log("Dumped profiles to profiles_dump.txt");
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

listProfiles();
