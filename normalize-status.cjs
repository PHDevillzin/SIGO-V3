require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function normalizeStatus() {
    const client = await pool.connect();
    try {
        console.log("Normalizing Status...");

        // Default Statuses
        await client.query("UPDATE requests SET status = 'Pendente' WHERE status IS NULL OR status = '';");
        await client.query("UPDATE requests SET status = 'Em Análise' WHERE status = 'Em Analise' OR status = 'Analise';");

        console.log("Done.");
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

normalizeStatus();
