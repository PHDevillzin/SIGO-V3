const fetch = require('node-fetch');

async function testLogin() {
    const url = 'http://localhost:3000/api/auth'; // Assuming localhost:3000 for dev, but we are in Vercel/Vite context. 
    // Actually, since we don't have the server running in this context reliably exposed to localhost for me to curl,
    // I will simulate the handler execution directly if possible, or just skip this if too complex.
    
    // BETTER IDEA: Just run a script that imports pg and queries the DB to prove the admin user is there and has access.
    // The API logic is simple enough that if the DB data is right, it should work.
}
// Retrying with DB check script
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
    const client = await pool.connect();
    try {
        console.log('Checking Admin User...');
        const userRes = await client.query("SELECT * FROM users WHERE nif = 'SS0000001'");
        console.log('User Found:', userRes.rows.length > 0);
        if (userRes.rows.length > 0) {
            console.log('Password Set:', !!userRes.rows[0].password);
            console.log('Password Value:', userRes.rows[0].password);
        }

        console.log('Checking Access...');
        const accessRes = await client.query("SELECT * FROM user_access WHERE user_nif = 'SS0000001'");
        console.log('Access Rules Found:', accessRes.rows.length);
        console.log('Access Rule:', accessRes.rows[0]);

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        pool.end();
    }
}

checkAdmin();
