
require('dotenv').config({ path: 'c:\\Users\\Paulo H\\Desktop\\SIGO-V3\\.env' });
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        await pool.query("ALTER TABLE units RENAME COLUMN valor_unidade TO valor_imovel;");
        console.log("Migration applied successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
