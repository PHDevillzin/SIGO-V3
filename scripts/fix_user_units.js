
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
        const nif = 'SS0000002';
        const units = ['CE 355 - Jundiaí', 'CE 024 - Tatuí', 'CAT Rio Claro'];

        console.log(`Updating user ${nif} with units:`, units);

        const res = await client.query(`
            UPDATE users 
            SET linked_units = $1::text[] 
            WHERE nif = $2
            RETURNING name, linked_units
        `, [units, nif]);

        if (res.rows.length > 0) {
            console.log('Update Success:', res.rows[0]);
        } else {
            console.log('User not found to update.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
