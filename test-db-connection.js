import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Server time:', result.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
