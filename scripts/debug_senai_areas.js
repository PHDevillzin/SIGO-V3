
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
        console.log("Checking SENAI Requests for Area Visibility...");

        // Fetch recent SENAI requests
        const res = await client.query(`
            SELECT id, description, unit, status, area_responsavel, areas_envolvidas, manifestation_targets 
            FROM requests 
            WHERE entidade = 'SENAI' 
            ORDER BY id DESC 
            LIMIT 5
        `);

        console.log("Recent SENAI Requests:");
        res.rows.forEach(r => {
            console.log(`[ID ${r.id}] Unit: ${r.unit}, Status: ${r.status}`);
            console.log(`  Area Resp: '${r.area_responsavel}'`);
            console.log(`  Areas Env: '${r.areas_envolvidas}'`);
            console.log(`  Manif Targets:`, r.manifestation_targets);
            console.log("---");
        });

    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
