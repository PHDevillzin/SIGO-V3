
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('Connected to DB');

        // Find candidates
        // "ultimas 6 demandas criadas e que não tem a area fim adicionada"
        // Interpreting as: The last 6 records found when filtering by "missing area_responsavel" sorted by creation (id desc).

        const findQuery = `
            SELECT id, description 
            FROM requests 
            WHERE area_responsavel IS NULL OR area_responsavel = '' 
            ORDER BY id DESC 
            LIMIT 6
        `;

        const res = await client.query(findQuery);

        if (res.rows.length === 0) {
            console.log('No requests found matching criteria.');
            return;
        }

        const ids = res.rows.map(r => r.id);
        console.log('Found requests to delete:', ids);

        // Delete movements first
        const deleteMovementsQuery = `DELETE FROM movements WHERE request_id = ANY($1::int[])`;
        await client.query(deleteMovementsQuery, [ids]);
        console.log('Deleted associated movements.');

        // Delete requests
        const deleteRequestsQuery = `DELETE FROM requests WHERE id = ANY($1::int[])`;
        await client.query(deleteRequestsQuery, [ids]);
        console.log('Deleted requests.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
