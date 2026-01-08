require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkUnitsSchema() {
    const client = await pool.connect();
    try {
        console.log('Checking units table columns...');
        const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'units';
    `);

        const columns = res.rows.map(r => r.column_name);
        console.log('Columns:', columns);
        console.log('Has status?', columns.includes('status'));

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

checkUnitsSchema();
