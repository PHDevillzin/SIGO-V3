
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
        console.log("Searching for Ana Silva...");
        const res = await client.query(`
            SELECT u.id, u.name, u.nif, u.sigo_profiles, u.linked_units, 
                   array_agg(ua.profile_id) as computed_profiles,
                   array_agg(un.unidade) as computed_units
            FROM users u
            LEFT JOIN user_access ua ON u.nif = ua.user_nif
            LEFT JOIN units un ON ua.unit_id = un.id
            WHERE u.name ILIKE '%Ana Silva%'
            GROUP BY u.id
        `);

        if (res.rows.length === 0) {
            console.log("No user found matching 'Ana Silva'");
        } else {
            console.log("User Found:", JSON.stringify(res.rows[0], null, 2));
        }

        console.log("\nSearching for potentially related SENAI requests:");
        const reqs = await client.query(`SELECT id, unit, entidade, status, current_location FROM requests WHERE entidade = 'SENAI' ORDER BY id DESC LIMIT 5`);
        console.table(reqs.rows);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
