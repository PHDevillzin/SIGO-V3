const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    console.log('Connected to database.');

    try {
        const columns = [
            'plano_diretor TEXT'
        ];

        for (const col of columns) {
            const colName = col.split(' ')[0];
            try {
                await client.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS ${col}`);
                console.log(`Added column ${colName} (if not exists)`);
            } catch (err) {
                console.error(`Error adding column ${colName}:`, err.message);
            }
        }

        console.log('Migration complete.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
