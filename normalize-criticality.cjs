require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function normalizeCriticality() {
    const client = await pool.connect();
    try {
        console.log("Normalizing Criticality...");

        // Map arbitrary values to Enum values
        await client.query("UPDATE requests SET criticality = 'Média' WHERE criticality = 'Média' OR criticality = 'Media' OR criticality = 'Medium' OR criticality = 'MEDIA';");
        await client.query("UPDATE requests SET criticality = 'Mínima' WHERE criticality = 'Minima' OR criticality = 'Minimum' OR criticality = 'MINIMA' OR criticality = 'Baixa';");
        await client.query("UPDATE requests SET criticality = 'Crítica' WHERE criticality = 'Critica' OR criticality = 'Critical' OR criticality = 'CRITICA';");
        await client.query("UPDATE requests SET criticality = 'Imediata' WHERE criticality = 'Immediate' OR criticality = 'IMEDIATA';");

        // Check defaults
        await client.query("UPDATE requests SET criticality = 'Média' WHERE criticality IS NULL;");

        console.log("Done.");
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

normalizeCriticality();
