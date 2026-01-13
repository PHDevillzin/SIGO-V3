const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon/Vercel mostly
});

const users = [
  { nif: 'SS0000002', name: 'Ana Beatriz Costa' },
  { nif: 'SN0000004', name: 'Bruno Alves' },
  { nif: 'SS0000003', name: 'Carlos Eduardo Lima' },
  { nif: 'SN0000005', name: 'Daniela Ferreira' },
  { nif: 'SS0000004', name: 'Fernando Almeida' },
  { nif: 'SN0000006', name: 'Fernanda Gonçalves' },
  { nif: 'SS0000005', name: 'Gustavo Ribeiro' },
  { nif: 'SN0000007', name: 'Helena Souza' },
  { nif: 'SN0000001', name: 'Daniel' },
  { nif: 'SN0000002', name: 'Rafael' },
  { nif: 'SN0000003', name: 'Teste' },
  { nif: 'SN0000008', name: 'Ana Silva' }
];

async function seed() {
    console.log('Starting User Seeding/Update...');
    const client = await pool.connect();
    try {
        for (const u of users) {
            const email = `${u.nif.toLowerCase()}@sesisenaisp.org.br`; // Generating a standard email
            console.log(`Processing ${u.nif} - ${u.name}...`);
            const res = await client.query(`
                INSERT INTO users (nif, name, email, password, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, '123456', true, NOW(), NOW())
                ON CONFLICT (nif) DO UPDATE
                SET name = $2,
                    is_active = true,
                    password = '123456', -- Enforcing default password as requested
                    updated_at = NOW()
                RETURNING nif, name, is_active;
            `, [u.nif, u.name, email]);
            console.log(` > ${res.rows[0].nif} Saved/Updated.`);
        }
        console.log('All users processed successfully.');
    } catch (e) {
        console.error('Error seeding users:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
