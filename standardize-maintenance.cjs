require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function standardize() {
    const client = await pool.connect();
    try {
        console.log("Standardizing Maintenance Records...");
        await client.query(`
        UPDATE requests 
        SET executing_unit = 'GSO',
            unit = 'Sede'
        WHERE categoria_investimento = 'Manutenção'
    `);
        console.log("Done.");
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

standardize();
