const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/sigo_v3',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    const res = await client.query('SELECT name, permissions FROM profiles ORDER BY name');

    console.log('--- Current Profile Permissions ---');
    res.rows.forEach(row => {
        console.log(`\nProfile: ${row.name}`);
        console.log('Permissions:');
        const perms = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
        if (Array.isArray(perms)) {
            perms.forEach(p => console.log(`  - ${p}`));
        } else {
            console.log('  (Invalid format)', perms);
        }
    });

    await client.end();
}

run().catch(e => console.error(e));
