require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function repairData() {
    const client = await pool.connect();
    try {
        console.log("Updating ID 20...");
        await client.query(`
        UPDATE requests 
        SET description = 'Manutenção de Ar Condicionado', 
            unit = 'SEDE', 
            status = 'Pendente',
            criticality = 'Média',
            expected_value = 'R$ 5.000,00',
            executing_unit = 'Facilities'
        WHERE id = 20
    `);

        console.log("Updating ID 21...");
        await client.query(`
        UPDATE requests 
        SET description = 'Troca de Lâmpadas', 
            unit = 'CAT SESI', 
            status = 'Em Análise',
            criticality = 'Baixa',
            expected_value = 'R$ 500,00',
            executing_unit = 'Manutenção Local'
        WHERE id = 21
    `);

        console.log("Update Complete.");

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

repairData();
