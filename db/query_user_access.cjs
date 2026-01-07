
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const res = await pool.query('SELECT * FROM user_access');
    console.log('User Access Records:', res.rows);
    
    const users = await pool.query('SELECT nif, name, sigo_profiles, linked_units FROM users');
    console.log('Users (Sample):', users.rows.slice(0, 3));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
