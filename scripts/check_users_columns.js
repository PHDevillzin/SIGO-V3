
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
        const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
        console.log('Columns:', res.rows.map(r => r.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
