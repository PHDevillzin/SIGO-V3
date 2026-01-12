const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('Adding is_approver and is_requester columns to users table...');
        
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_approver') THEN
                    ALTER TABLE users ADD COLUMN is_approver BOOLEAN DEFAULT FALSE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_requester') THEN
                    ALTER TABLE users ADD COLUMN is_requester BOOLEAN DEFAULT FALSE;
                END IF;
            END
            $$;
        `);

        console.log('Columns added successfully.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        client.release();
        pool.end();
    }
}

run();
