const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// --- Helper Data & Generators ---

const criticalidades = ['Baixa', 'Média', 'Alta'];
const causas = ['Análise de solicitação'];
const locaisAtuais = [
    'Gestão Corporativa', 
    'Gestão Área Fim', 
    'Alta Administração (SEO)', 
    'GSO', 
    'Gerência de Infraestrutura',
    'Planejamento'
];
const categoriasInvestimento = [
    'Reforma Operacional', 
    'Intervenção Estratégica', 
    'Manutenção Corretiva', 
    'Expansão',
    'Modernização'
];
const tiposServico = ['Sede', 'Estratégico', 'Operacional', 'Consultoria'];
const areasFim = [
    'Gerência Sênior de Tecnologia', 
    'Gerência de Infraestrutura e Suporte', 
    'Controle de Execução', 
    'Recursos Humanos',
    'Financeiro'
];
const entidades = ['SESI', 'SENAI'];

const descricoes = [
    "Reforma da entrada principal",
    "Instalação de ar condicionado no bloco B",
    "Pintura externa do prédio administrativo",
    "Troca de piso do refeitório",
    "Modernização da rede elétrica",
    "Instalação de painéis solares",
    "Readequação de acessibilidade",
    "Construção de quadra poliesportiva",
    "Reparo no telhado do galpão",
    "Atualização do sistema de segurança",
    "Reforma dos vestiários",
    "Instalação de laboratório de informática",
    "Manutenção do sistema hidráulico",
    "Paisagismo da área externa",
    "Ampliação da biblioteca"
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatMoney(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace('.', ',') + ' mi';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + ' mil';
    } else {
        return value.toString();
    }
}

function generateOrderCode(entidade, year, id) {
    // Ex: SS-25-00034
    const prefix = entidade === 'SESI' ? 'SS' : 'SN';
    const yearSuffix = year.toString().slice(-2);
    const idStr = id.toString().padStart(5, '0');
    return `${prefix}-${yearSuffix}-${idStr}`;
}

async function run() {
    await client.connect();
    console.log('Connected to database.');

    try {
        // 1. Fetch existing Units for realism
        console.log('Fetching units...');
        const unitsRes = await client.query('SELECT unidade_resumida, unidade FROM units WHERE unidade_resumida IS NOT NULL LIMIT 200');
        const units = unitsRes.rows.length > 0 ? unitsRes.rows.map(r => r.unidade_resumida || r.unidade) : ['Unidade Padrão'];

        // 2. Fetch existing names for Gestor Local
        console.log('Fetching potential managers (users)...');
        const usersRes = await client.query('SELECT name FROM users LIMIT 100');
        const managers = usersRes.rows.length > 0 ? usersRes.rows.map(r => r.name) : ['Gerente Padrão'];

        // 3. Fetch Tipologias
        console.log('Fetching tipologias...');
        const tipologiasRes = await client.query('SELECT titulo FROM tipologias LIMIT 50');
        const tipologias = tipologiasRes.rows.length > 0 ? tipologiasRes.rows.map(r => r.titulo) : ['Reforma Geral', 'Manutenção Predial', 'Nova Construção'];

        const totalRecords = 160;
        console.log(`Generating ${totalRecords} request records...`);

        const values = [];
        const placeholders = [];
        
        // Start date for random generation
        const startDate = new Date(2023, 0, 1);
        const endDate = new Date(2029, 11, 31);

        for (let i = 0; i < totalRecords; i++) {
            const dataInicio = generateRandomDate(startDate, endDate);
            const year = dataInicio.getFullYear();
            
            const entidade = getRandomElement(entidades);
            const ordem = generateOrderCode(entidade, year, i + 1);
            
            const valorNum = getRandomInt(10000, 5000000); // 10k to 5M
            const valorFormatado = formatMoney(valorNum);

            const record = [
                getRandomElement(criticalidades), // criticality
                getRandomElement(units), // unit
                getRandomElement(descricoes), // description
                getRandomElement(causas), // status (mapped to 'Causa' in UI based on image, but schema says status) -> Validating against schema: status column usually holds workflow status. Image shows 'Causa'. Let's check schema again. Schema has 'status' and 'causa' isn't explicitly there but maybe 'status' is used or 'situacao_projeto'. 
                // Wait, looking at the image: 'Causa' column content is "Análise de solicitação". 
                // Schema `requests` table has: status, situacao_projeto, situacao_obra. 
                // Let's assume 'status' for now as generic workflow state.
                // "Análise de solicitação", // status - Removed as it was duplicate

                getRandomElement(locaisAtuais), // current_location
                getRandomElement(managers), // gestor_local
                dataInicio, // expected_start_date
                true, // has_info
                valorFormatado, // expected_value
                "GSO", // executing_unit (Unidade Comum in image?) Image says 'Unidade Comum' -> GSO.
                getRandomInt(30, 365), // prazo
                getRandomElement(categoriasInvestimento), // categoria_investimento
                entidade, // entidade
                ordem, // ordem
                "Em andamento", // situacao_projeto
                "N/A", // situacao_obra
                null, // inicio_obra
                getRandomElement(tipologias), // tipologia
                getRandomElement(managers), // solicitante
                "GSO", // gerencia
                getRandomElement(areasFim), // area_responsavel (mapped to Área Fim in image?)
                getRandomElement(tiposServico) // atividade (mapped to Tipo Serviço?) -- schema has 'atividade' and 'tipo_servico' is not in schema list printed earlier but 'atividade' is.
                // Re-checking schema for 'Tipo Serviço'. 
                // Schema columns: ... id, criticality, unit, description, status, current_location, gestor_local, expected_start_date, has_info, expected_value, executing_unit, prazo, categoria_investimento, entidade, ordem, situacao_projeto, situacao_obra, inicio_obra, saldo_obra_prazo, saldo_obra_valor, tipologia ...
                // New columns added: solicitante, gerencia, objetivo ... area_responsavel ... atividade ...
            ];
            
            // We need to match the columns in the INSERT statement.
            // Let's construct a parameterized query for a single row or batch.
            // For simplicity and safety against parameter limits, let's do single inserts or smaller batches. 
            // Loop insert is fine for 150 records.
            
            const insertQuery = `
                INSERT INTO requests (
                    criticality, unit, description, status, current_location, gestor_local, 
                    expected_start_date, has_info, expected_value, executing_unit, prazo, 
                    categoria_investimento, entidade, ordem, situacao_projeto, situacao_obra, 
                    inicio_obra, tipologia, solicitante, gerencia, area_responsavel, atividade
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            `;

            await client.query(insertQuery, record);
        }

        console.log('Successfully inserted records.');

    } catch (err) {
        console.error('Error inserting requests:', err);
    } finally {
        await client.end();
    }
}

run();
