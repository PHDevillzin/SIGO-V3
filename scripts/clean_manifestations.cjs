const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanManifestations() {
  try {
    const client = await pool.connect();
    try {
      console.log('Cleaning manifestations...');
      // Update all requests to have empty manifestations array
      // Treating column as text since it holds stringified JSON
      const res = await client.query(`
        UPDATE requests 
        SET manifestations = '[]' 
        WHERE manifestations IS NOT NULL
      `);
      console.log(`Updated ${res.rowCount} requests.`);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error executing query', err);
  } finally {
    await pool.end();
  }
}

cleanManifestations();
