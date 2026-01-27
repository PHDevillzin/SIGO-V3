const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const mappings = [
    { old: 'Expansão', new: 'Nova Unidade' },
    { old: 'Reforma Estratégica', new: 'Intervenção Estratégica' },
    { old: 'Modernização', new: 'Reforma Operacional' },
    { old: 'Manutenção Corretiva', new: 'Manutenção' },
    { old: 'Manutenção Preventiva', new: 'Manutenção' } // Just in case
];

async function run() {
    await client.connect();
    console.log('Connected to database.');

    try {
        for (const map of mappings) {
            const res = await client.query(
                `UPDATE requests SET categoria_investimento = $1 WHERE categoria_investimento = $2`,
                [map.new, map.old]
            );
            if (res.rowCount > 0) {
                console.log(`Updated ${res.rowCount} records from '${map.old}' to '${map.new}'.`);
            }
        }
        console.log('Category update complete.');

    } catch (err) {
        console.error('Error updating categories:', err);
    } finally {
        await client.end();
    }
}

run();
