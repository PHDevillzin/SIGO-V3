
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
        const nif = 'SN0000004'; // Bruno Alves
        // FOUND CORRECT ID:
        const profileId = 'gerencia_de_educacao_ged';
        const instituicao = 'SENAI';

        console.log(`Fixing User Access for ${nif} (${profileId})...`);

        // Check if access exists
        const check = await client.query(`SELECT * FROM user_access WHERE user_nif = $1 AND profile_id = $2`, [nif, profileId]);

        if (check.rows.length === 0) {
            console.log("Access missing in 'user_access' table. Inserting...");
            await client.query(`
                INSERT INTO user_access (user_nif, profile_id, instituicao, unit_id)
                VALUES ($1, $2, $3, NULL)
            `, [nif, profileId, instituicao]);
            console.log("Inserted successfully.");

            // Log verification
            const verify = await client.query(`SELECT * FROM user_access WHERE user_nif = $1`, [nif]);
            console.log("Current Access:", verify.rows);

        } else {
            console.log("Access already exists in 'user_access'.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
