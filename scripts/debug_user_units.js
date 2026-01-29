
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
        console.log("Checking User SS0000002...");
        const userRes = await client.query(`SELECT name, linked_units FROM users WHERE nif = 'SS0000002'`);
        if (userRes.rows.length === 0) {
            console.log("User NOT FOUND");
        } else {
            console.log("User Found:", userRes.rows[0]);

            // Check Requests
            console.log("Checking Requests...");
            const reqRes = await client.query(`SELECT id, unit, entidade, status FROM requests WHERE entidade = 'SENAI' ORDER BY id DESC LIMIT 5`);
            console.log("Requests found:", reqRes.rows);
        }
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
