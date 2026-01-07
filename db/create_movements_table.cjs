const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_t46FEzuVXZYg@ep-young-waterfall-ac025d11-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Creating movements table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS movements (
        id SERIAL PRIMARY KEY,
        request_id INTEGER REFERENCES requests(id),
        status VARCHAR(100) NOT NULL,
        user_name VARCHAR(255),
        user_department VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      );
    `);

    console.log('Movements table created successfully.');
    
    // Seed some initial movements for existing requests
    console.log('Seeding initial movements...');
    
    // Get all requests
    const res = await client.query('SELECT id, status FROM requests');
    const requests = res.rows;

    for (const req of requests) {
         // Initial creation movement
         await client.query(`
            INSERT INTO movements (request_id, status, user_name, user_department, created_at)
            VALUES ($1, 'Solicitação criada', 'Sistema', 'Automático', NOW() - INTERVAL '1 day')
         `, [req.id]);
         
         // Current status movement
         await client.query(`
            INSERT INTO movements (request_id, status, user_name, user_department, created_at)
            VALUES ($1, $2, 'Sistema', 'Automático', NOW())
         `, [req.id, req.status]);
    }

    console.log('Initial movements seeded.');

  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
