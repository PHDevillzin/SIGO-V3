
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
        const nif = 'SN0000004';
        const profiles = ['Gerência de Educação (GED)'];

        console.log(`Updating user ${nif} with profiles:`, profiles);

        const res = await client.query(`
            UPDATE users 
            SET sigo_profiles = $1::text[] 
            WHERE nif = $2
            RETURNING name, sigo_profiles
        `, [profiles, nif]);

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
