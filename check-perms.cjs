require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
    const client = await pool.connect();
    try {
        console.log("--- USERS & PERMISSIONS ---");
        const res = await client.query('SELECT name, profile, linked_units FROM users');
        res.rows.forEach(u => {
            console.log(`User: ${u.name} | Profile: ${u.profile} | Linked: ${JSON.stringify(u.linked_units)}`);
        });

        console.log("\n--- REQUESTS TARGETS ---");
        const reqs = await client.query("SELECT id, unit FROM requests WHERE categoria_investimento = 'Manutenção'");
        reqs.rows.forEach(r => console.log(`Req ${r.id} -> Unit: '${r.unit}'`));

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

checkUsers();
