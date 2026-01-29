
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
        const nif = 'SN0000008';

        // 1. Check user_access
        const ua = await client.query(`
            SELECT ua.profile_id, u.unidade as unit_name
            FROM user_access ua
            LEFT JOIN units u ON ua.unit_id = u.id
            WHERE ua.user_nif = $1
        `, [nif]);

        console.log("User Access Records:", JSON.stringify(ua.rows, null, 2));

        const linkedUnitNames = ua.rows.map(r => r.unit_name).filter(Boolean);

        if (linkedUnitNames.length > 0) {
            console.log(`User has units: ${JSON.stringify(linkedUnitNames)}`);
            const reqs = await client.query(`
                SELECT id, unit, status, description, entidade 
                FROM requests 
                WHERE unit = ANY($1) AND entidade = 'SENAI'
                LIMIT 5
            `, [linkedUnitNames]);
            console.log("Matching Requests:", JSON.stringify(reqs.rows, null, 2));

            // Check direct exact match for Vila Alpina
            const direct = await client.query(`SELECT id, unit FROM requests WHERE unit LIKE '%Vila Alpina%'`);
            console.log("Direct Search for 'Vila Alpina':", JSON.stringify(direct.rows, null, 2));

        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
