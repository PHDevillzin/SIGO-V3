const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        console.log('Connected to database.');

        // 1. Add Column if not exists
        console.log('Adding "instituicao" column to "user_access"...');
        await client.query(`
            ALTER TABLE user_access 
            ADD COLUMN IF NOT EXISTS instituicao VARCHAR(10);
        `);
        console.log('Column added (or already exists).');

        // 2. Update existing records
        console.log('Updating existing records based on NIF...');

        // Update SESI (Starts with SS)
        const updateSesi = await client.query(`
            UPDATE user_access
            SET instituicao = 'SESI'
            WHERE user_nif LIKE 'SS%' OR user_nif LIKE 'ss%';
        `);
        console.log(`Updated ${updateSesi.rowCount} records to SESI.`);

        // Update SENAI (Starts with SN)
        const updateSenai = await client.query(`
            UPDATE user_access
            SET instituicao = 'SENAI'
            WHERE user_nif LIKE 'SN%' OR user_nif LIKE 'sn%';
        `);
        console.log(`Updated ${updateSenai.rowCount} records to SENAI.`);

    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
        console.log('Disconnected.');
    }
}

run();
