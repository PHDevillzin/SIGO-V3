const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        console.log('Connected to database.');

        // 1. Drop Columns
        console.log('Dropping columns profile and unidade from users...');
        await client.query("ALTER TABLE users DROP COLUMN IF EXISTS profile");
        await client.query("ALTER TABLE users DROP COLUMN IF EXISTS unidade");
        console.log('Columns dropped.');

        // 2. Verify Admin Access
        console.log('Verifying Admin Access...');
        const nif = 'SS0000001';
        const profileId = 'administrador_do_sistema'; // Slugified ID

        // Check if user exists
        const userRes = await client.query("SELECT * FROM users WHERE nif = $1", [nif]);
        if (userRes.rows.length === 0) {
            console.log(`Admin user ${nif} not found! This should not happen if reseed ran.`);
            // Inserting if missing (safety net)
            await client.query(
                "INSERT INTO users (nif, name, email, created_at, updated_at) VALUES ($1, 'Admin System', 'admin@sigo.com', NOW(), NOW())",
                [nif]
            );
            console.log(`Admin user ${nif} created.`);
        }

        // Check/Grant Access
        const uaRes = await client.query(
            "SELECT * FROM user_access WHERE user_nif = $1 AND profile_id = $2",
            [nif, profileId]
        );

        if (uaRes.rows.length === 0) {
            console.log('Admin access missing. Inserting...');
            await client.query(
                "INSERT INTO user_access (user_nif, profile_id, unit_id) VALUES ($1, $2, NULL)",
                [nif, profileId]
            );
            console.log('Admin access validated.');
        } else {
            console.log('Admin access already valid.');
        }

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
        console.log('Disconnected.');
    }
}

run();
