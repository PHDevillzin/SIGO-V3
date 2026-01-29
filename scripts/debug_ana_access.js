
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
        console.log(`Inspecting access for Ana Silva (${nif})...`);

        // 1. Check user_access
        const ua = await client.query(`
            SELECT ua.*, p.name as profile_name, u.unidade as unit_name
            FROM user_access ua
            LEFT JOIN profiles p ON ua.profile_id = p.id
            LEFT JOIN units u ON ua.unit_id = u.id
            WHERE ua.user_nif = $1
        `, [nif]);

        console.log("User Access Records:");
        console.table(ua.rows);

        // 2. Check Requests she *should* see
        // If she has units, list requests for those units.
        // If she has NO units, list SOME SENAI requests to propose linking.
        const linkedUnitNames = ua.rows.map(r => r.unit_name).filter(Boolean);

        if (linkedUnitNames.length > 0) {
            console.log(`User has units: ${linkedUnitNames.join(', ')}`);
            const reqs = await client.query(`
                SELECT id, unit, status, description 
                FROM requests 
                WHERE unit = ANY($1) AND entidade = 'SENAI'
                LIMIT 5
            `, [linkedUnitNames]);
            console.log("Matching Requests:");
            console.table(reqs.rows);
        } else {
            console.log("User has NO linked units.");
            const reqs = await client.query(`
                SELECT DISTINCT unit 
                FROM requests 
                WHERE entidade = 'SENAI' 
                LIMIT 5
            `);
            console.log("Available SENAI Units in Requests (Candidates for linking):");
            console.table(reqs.rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
