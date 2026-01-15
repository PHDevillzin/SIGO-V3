
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgres://default:A6sJ2IuDntYg@ep-crimson-sun-a4773832-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        await pool.query("ALTER TABLE units ADD COLUMN IF NOT EXISTS valor_unidade VARCHAR(100);");
        console.log("Migration applied successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
