const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        const nif = 'SS0000001';
        console.log(`Checking access for ${nif}...`);

        const res = await client.query(`
            SELECT 
                ua.user_nif,
                ua.profile_id, 
                p.name as profile_name,
                ua.unit_id
            FROM user_access ua
            LEFT JOIN profiles p ON ua.profile_id = p.id
            WHERE ua.user_nif = $1
        `, [nif]);

        console.table(res.rows);

        if (res.rows.length === 0) {
            console.log('No rows found in user_access!');
        } else {
            const row = res.rows[0];
            const isAdminSlug = row.profile_id === 'administrador_do_sistema';
            const isAdminName = row.profile_name === 'Administrador do sistema';
            console.log(`Is Admin Slug Match? ${isAdminSlug} (Expected 'administrador_do_sistema' vs '${row.profile_id}')`);
            console.log(`Is Admin Name Match? ${isAdminName} (Expected 'Administrador do sistema' vs '${row.profile_name}')`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
