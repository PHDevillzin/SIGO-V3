require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateProfiles() {
    const client = await pool.connect();
    try {
        console.log("--- STARTING PROFILE UPDATE ---");

        // 1. Check current state
        const checkRes = await client.query("SELECT id, name, category FROM profiles WHERE category = 'Geral' OR category = 'GERAL'");
        console.log(`Found ${checkRes.rowCount} profiles with category 'Geral'/'GERAL':`);
        checkRes.rows.forEach(r => console.log(` - ${r.name} (${r.id})`));

        if (checkRes.rowCount === 0) {
            console.log("No profiles need updating.");
            return;
        }

        // 2. Update
        // Updating to 'CORPORATIVO' to match uppercase convention often seen in DBs, or 'Corporativo' if that's the standard.
        // Looking at api/profiles.ts line 79: "category || 'GERAL'". It uses uppercase.
        // Let's use 'CORPORATIVO'.
        const updateRes = await client.query(
            "UPDATE profiles SET category = 'CORPORATIVO' WHERE category = 'Geral' OR category = 'GERAL' RETURNING id, name"
        );

        console.log(`\nSuccessfully updated ${updateRes.rowCount} profiles to 'CORPORATIVO'.`);

        // 3. Verify
        const verifyRes = await client.query("SELECT id, name, category FROM profiles WHERE id = ANY($1::text[])", [updateRes.rows.map(r => r.id)]);
        verifyRes.rows.forEach(r => console.log(`VERIFY: ${r.name} is now ${r.category}`));

    } catch (err) {
        console.error('Error executing update', err);
    } finally {
        client.release();
        await pool.end();
    }
}

updateProfiles();
