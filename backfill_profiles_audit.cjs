require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function backfill() {
    const client = await pool.connect();
    try {
        console.log("Backfilling audit columns for existing profiles...");

        // Update all profiles where created_by is null
        const result = await client.query(`
            UPDATE profiles 
            SET 
                created_at = NOW(),
                created_by = 'Sistema',
                updated_at = NOW(),
                updated_by = 'Sistema',
                last_action = 'Cadastro'
            WHERE created_by IS NULL;
        `);

        console.log(`Updated ${result.rowCount} profiles.`);

    } catch (err) {
        console.error('Error backfilling:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

backfill();
