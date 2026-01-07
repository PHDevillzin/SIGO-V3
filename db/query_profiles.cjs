
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const res = await pool.query('SELECT * FROM profiles');
    console.log('Profiles:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
