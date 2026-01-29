
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Update Logic
        // < 3 months implies <= 3 based on user description "menos de 3... 4 a 10". If 3 is the gap, I assumed <= 3 is Low.
        // "Projeto com menos de 3 meses é baixa criticidade" -> strictly < 3.
        // "com 4 a 10 meses media" -> 4 <= x <= 10.
        // So 3 is strictly undefined.
        // "acima deve ser cadastrado como alta criticida" -> > 10.
        // However, usually ranges are contiguous. 1, 2, 3, 4.
        // If I use < 3, and >= 4. 3 is missing.
        // I will stick to: <= 3 is Minima, 4-10 is Media, > 10 is Critica.

        const queries = [
            // Baixa (Mínima) for prazo <= 3
            `UPDATE requests 
       SET criticality = 'Mínima' 
       WHERE (criticality IS NULL OR criticality = '') 
       AND prazo <= 3`,

            // Média for prazo 4 to 10
            `UPDATE requests 
       SET criticality = 'Média' 
       WHERE (criticality IS NULL OR criticality = '') 
       AND prazo >= 4 AND prazo <= 10`,

            // Alta (Crítica) for prazo > 10
            `UPDATE requests 
       SET criticality = 'Crítica' 
       WHERE (criticality IS NULL OR criticality = '') 
       AND prazo > 10`
        ];

        for (const query of queries) {
            console.log(`Executing: ${query}`);
            const res = await client.query(query);
            console.log(`Updated ${res.rowCount} rows.`);
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
