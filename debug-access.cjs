require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAccess() {
    const client = await pool.connect();
    try {
        console.log("--- UNITS ---");
        const units = await client.query('SELECT unidade FROM units LIMIT 5');
        console.log(JSON.stringify(units.rows));

        console.log("\n--- USERS ---");
        const users = await client.query('SELECT name, permissions, linked_units FROM users');
        console.log(JSON.stringify(users.rows));

        console.log("\n--- MAINTENANCE REQS ---");
        const reqs = await client.query("SELECT id, description, executing_unit FROM requests WHERE categoria_investimento = 'Manutenção'");
        console.log(JSON.stringify(reqs.rows));

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

checkAccess();
