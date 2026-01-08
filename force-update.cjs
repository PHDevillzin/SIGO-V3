require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function forceUpdate() {
    const client = await pool.connect();
    try {
        console.log("Forcing update for ID 20, 21...");
        const res = await client.query("UPDATE requests SET unit = 'Sede' WHERE id IN (20, 21)");
        console.log(`Updated ${res.rowCount} rows.`);

        const check = await client.query("SELECT id, unit FROM requests WHERE id IN (20, 21)");
        check.rows.forEach(r => console.log(`ID ${r.id} Unit is now: '${r.unit}'`));

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

forceUpdate();
