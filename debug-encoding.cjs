require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runTest() {
    const client = await pool.connect();
    try {
        // 1. Check encoding of existing Manutenção
        const res = await client.query("SELECT id, categoria_investimento, encode(categoria_investimento::bytea, 'hex') as hex FROM requests WHERE categoria_investimento LIKE 'Manuten%'");
        console.log("Existing 'Manutenção' entries hex dump:");
        res.rows.forEach(r => console.log(`${r.id}: ${r.categoria_investimento} -> ${r.hex}`));

        // 2. Insert a purely ASCII category record to test if it appears (we'll need to temporarily hack the frontend filter to see it, or trust me)
        // Actually, I'll update one of the existing defined IDs (20 or 21) to ensure we aren't fighting undefined ID issues.

        // Let's reset ID 21 to have a slightly different category verifying exact string match isn't the issue.
        // Wait, if I change the category, the frontend filter `=== 'Manutenção'` won't pick it up.

        // Instead, let's FORCE set the category to the exact expected string literal in SQL
        await client.query(`
        UPDATE requests 
        SET categoria_investimento = 'Manutenção' 
        WHERE id IN (20, 21);
    `);
        console.log("Forced update of ID 20, 21 to 'Manutenção'.");

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

runTest();
