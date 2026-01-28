
const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database.. Checking columns...');

    try {
        // Check manifestation_targets
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='manifestation_targets') THEN 
                    ALTER TABLE requests ADD COLUMN manifestation_targets TEXT; 
                    RAISE NOTICE 'Added manifestation_targets column';
                ELSE
                    RAISE NOTICE 'manifestation_targets column already exists';
                END IF;
            END $$;
        `);

        // Check manifestations
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='manifestations') THEN 
                    ALTER TABLE requests ADD COLUMN manifestations TEXT; 
                    RAISE NOTICE 'Added manifestations column';
                ELSE
                    RAISE NOTICE 'manifestations column already exists';
                END IF;
            END $$;
        `);

        console.log('Migration completed successfully.');
    } finally {
        client.release();
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
