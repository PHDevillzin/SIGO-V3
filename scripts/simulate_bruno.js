
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SENAI_CORPORATE_PROFILES = [
    'Gerência de Educação',
    'Gerência de Tecnologia',
    'Gerência de Infraestrutura',
    'Gerência de Saúde'
];

async function run() {
    const client = await pool.connect();
    try {
        // User Bruno
        const user = { name: 'Bruno Alves' };
        const selectedProfile = 'Gerência de Educação (GED)';

        // Get 1 SENAI Request
        const reqRes = await client.query(`
            SELECT id, unit, entidade, status 
            FROM requests 
            WHERE entidade = 'SENAI' 
            ORDER BY id DESC 
            LIMIT 1
        `);
        const req = reqRes.rows[0];

        console.log("=== DEBUG BRUNO VISIBILITY ===");
        console.log(`User Profile: "${selectedProfile}"`);
        console.log(`Request Entidade: "${req.entidade}"`);
        console.log(`Corporate Profiles List:`, SENAI_CORPORATE_PROFILES);

        // Logic Trace
        const matchProfile = SENAI_CORPORATE_PROFILES.some(p => {
            const match = selectedProfile.includes(p);
            console.log(`  Checking "${p}" vs "${selectedProfile}": ${match}`);
            return match;
        });

        const isSenai = req.entidade === 'SENAI';
        const isSenaiCorporate = matchProfile && isSenai;

        console.log(`\nRESULTS:`);
        console.log(`Profile Match: ${matchProfile}`);
        console.log(`Is SENAI: ${isSenai}`);
        console.log(`FINAL isSenaiCorporate: ${isSenaiCorporate}`);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
