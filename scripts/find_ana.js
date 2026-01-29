
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("Searching for 'Ana'...");
        const res = await client.query(`
            SELECT u.id, u.name, u.nif, u.sigo_profiles
            FROM users u
            WHERE u.name ILIKE '%Ana%'
        `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
