const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        const resUsers = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users'");
        console.log("Users Table Schema:");
        console.table(resUsers.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
