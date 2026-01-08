const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
}

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        console.log('Connected to database.');

        // 1. Get Profile ID for 'Administração do sistema'
        const profileRes = await client.query("SELECT id FROM profiles WHERE name = 'Administração do sistema'");

        if (profileRes.rows.length === 0) {
            console.error("Profile 'Administração do sistema' not found!");
            // List available profiles to debug
            const allProfiles = await client.query("SELECT * FROM profiles");
            console.log("Available profiles:", allProfiles.rows);
            return;
        }

        const profileId = profileRes.rows[0].id;
        console.log(`Found Admin Profile ID: ${profileId}`);

        // 2. Upsert User SS0000001
        const nif = 'SS0000001';
        const name = 'Administrador Sistema';
        const email = 'admin.sistema@sesisenaisp.org.br';

        await client.query(`
            INSERT INTO users (nif, name, email, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (nif) DO UPDATE 
            SET name = EXCLUDED.name, email = EXCLUDED.email, updated_at = NOW()
        `, [nif, name, email]);

        console.log(`User ${nif} (${name}) upserted successfully.`);

        // 3. Grant Access
        // Wipe existing access first
        await client.query('DELETE FROM user_access WHERE user_nif = $1', [nif]);

        // Insert Admin access (Unit ID is null for generic admin, or strict logic might require it? user logic seemed to handle null)
        // In the analyzed code: "const targetUnits = (linked_units && linked_units.length > 0) ? linked_units : [null];"
        // And "const uid = uname ? unitMap[uname] : null;"
        // So unit_id can be null if the column allows (which it should for admins).

        await client.query('INSERT INTO user_access (user_nif, profile_id, unit_id) VALUES ($1, $2, NULL)', [nif, profileId]);

        console.log(`Access granted for ${nif} with profile ID ${profileId} (Admin).`);

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
        console.log('Disconnected.');
    }
}

run();
