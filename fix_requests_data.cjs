const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const criticalidades = ['Baixa', 'Média', 'Alta'];
const locaisAtuais = ['Gestão Corporativa', 'Gestão Área Fim', 'GSO', 'Planejamento'];
const categoriasInvestimento = ['Reforma Operacional', 'Intervenção Estratégica', 'Manutenção Corretiva'];
const tiposServico = ['Sede', 'Estratégico', 'Operacional', 'Consultoria'];
const areasFim = ['Gerência Sênior de Tecnologia', 'Gerência de Infraestrutura', 'RH', 'Financeiro'];
const entidades = ['SESI', 'SENAI'];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderCode(entidade, year, id) {
    const prefix = entidade === 'SESI' ? 'SS' : 'SN';
    const yearSuffix = year.toString().slice(-2);
    const idStr = id.toString().padStart(5, '0');
    return `${prefix}-${yearSuffix}-${idStr}`;
}

async function run() {
    await client.connect();
    console.log('Connected to database.');

    try {
        console.log('Fetching users for managers...');
        const usersRes = await client.query('SELECT name FROM users LIMIT 100');
        const managers = usersRes.rows.map(r => r.name);

        console.log('Fetching rows with missing data...');
        // Identify rows where key new fields are null or empty
        const res = await client.query(`
            SELECT id, expected_start_date FROM requests 
            WHERE 
                atividade IS NULL OR atividade = '' OR
                area_responsavel IS NULL OR area_responsavel = '' OR
                gestor_local IS NULL OR gestor_local = '' OR
                ordem IS NULL OR ordem = '' OR
                entidade IS NULL OR entidade = ''
        `);

        console.log(`Found ${res.rowCount} records to update.`);

        for (const row of res.rows) {
            const entidade = getRandomElement(entidades);
            const date = row.expected_start_date ? new Date(row.expected_start_date) : new Date();
            const year = date.getFullYear();
            const ordem = generateOrderCode(entidade, year, row.id);

            await client.query(`
                UPDATE requests 
                SET 
                    atividade = COALESCE(NULLIF(atividade, ''), $1),
                    area_responsavel = COALESCE(NULLIF(area_responsavel, ''), $2),
                    gestor_local = COALESCE(NULLIF(gestor_local, ''), $3),
                    categoria_investimento = COALESCE(NULLIF(categoria_investimento, ''), $4),
                    entidade = COALESCE(NULLIF(entidade, ''), $5),
                    ordem = COALESCE(NULLIF(ordem, ''), $6),
                    criticality = COALESCE(NULLIF(criticality, ''), $7),
                    unit = COALESCE(NULLIF(unit, ''), 'Unidade Padrão'),
                    status = COALESCE(NULLIF(status, ''), 'Análise de solicitação'),
                    current_location = COALESCE(NULLIF(current_location, ''), $8)
                WHERE id = $9
            `, [
                getRandomElement(tiposServico),
                getRandomElement(areasFim),
                getRandomElement(managers) || 'Gerente Padrão',
                getRandomElement(categoriasInvestimento),
                entidade,
                ordem,
                getRandomElement(criticalidades),
                getRandomElement(locaisAtuais),
                row.id
            ]);
        }

        console.log('Update complete.');

    } catch (err) {
        console.error('Error updating records:', err);
    } finally {
        await client.end();
    }
}

run();
