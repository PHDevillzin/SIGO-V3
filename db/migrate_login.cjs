require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateLogin() {
    const client = await pool.connect();
    try {
        console.log('--- Starting Login System Migration ---');

        // 1. Add password column if not exists
        console.log('Adding password column...');
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN 
                    ALTER TABLE users ADD COLUMN password VARCHAR(255); 
                END IF; 
            END $$;
        `);

        // 2. Create user_access table
        console.log('Creating user_access table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_access (
                id SERIAL PRIMARY KEY,
                user_nif VARCHAR(20) REFERENCES users(nif),
                unit_id INTEGER REFERENCES units(id),
                profile_id VARCHAR(50) REFERENCES profiles(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Seed Admin User
        console.log('Seeding Admin User (SS0000001)...');
        // Ensure user exists (Upsert-like logic)
        const userCheck = await client.query("SELECT * FROM users WHERE nif = 'SS0000001'");
        
        if (userCheck.rows.length === 0) {
             console.log('Creating Admin user...');
             await client.query(`
                INSERT INTO users (nif, name, email, password, profile, created_at, updated_at)
                VALUES ('SS0000001', 'Administrador do Sistema', 'admin@sigo.com', '123456', 'Administração do sistema', NOW(), NOW())
             `);
        } else {
             console.log('Updating Admin user password...');
             await client.query("UPDATE users SET password = '123456', profile = 'Administração do sistema' WHERE nif = 'SS0000001'");
        }

        // 4. Link Admin Profile in user_access
        console.log('Linking Admin Profile...');
        // First ensure the profile exists in profiles table
        await client.query(`
            INSERT INTO profiles (id, name, permissions) 
            VALUES ('admin_sys', 'Administração do sistema', '{all}')
            ON CONFLICT (id) DO NOTHING
        `);

        // Then link in user_access
        // Note: Admin doesn't need unit_id as per requirement
        await client.query(`
            INSERT INTO user_access (user_nif, profile_id)
            SELECT 'SS0000001', 'admin_sys'
            WHERE NOT EXISTS (
                SELECT 1 FROM user_access WHERE user_nif = 'SS0000001' AND profile_id = 'admin_sys'
            )
        `);

        console.log('Migration Completed Successfully!');

    } catch (e) {
        console.error('Migration Failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrateLogin();
