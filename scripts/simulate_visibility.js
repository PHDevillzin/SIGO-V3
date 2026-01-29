
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Mock Data
const SENAI_CORPORATE_PROFILES = [
    'Gerência de Educação',
    'Gerência de Tecnologia',
    'Gerência de Infraestrutura',
    'Gerência de Saúde'
];

async function run() {
    const client = await pool.connect();
    try {
        // 1. Get Users
        const gedUserRes = await client.query(`SELECT * FROM users WHERE nif = 'SN0000004'`); // Bruno Alves
        const gestorUserRes = await client.query(`SELECT * FROM users WHERE nif = 'SS0000002'`); // Ana Beatriz

        const gedUser = gedUserRes.rows[0];
        const gestorUser = gestorUserRes.rows[0];

        // 2. Get Requests (Mapped roughly to frontend structure)
        const reqRes = await client.query(`
            SELECT 
                id, unit, description, status, current_location, 
                entidade, area_responsavel, areas_envolvidas, 
                manifestation_targets, manifestations, categoria_investimento,
                solicitante
            FROM requests 
            WHERE entidade = 'SENAI' 
            ORDER BY id DESC 
            LIMIT 5
        `);

        const requests = reqRes.rows.map(r => ({
            id: r.id,
            unit: r.unit,
            description: r.description,
            status: r.status,
            currentLocation: r.current_location,
            entidade: r.entidade,
            areaResponsavel: r.area_responsavel,
            areasEnvolvidas: r.areas_envolvidas, // String in DB?
            manifestationTargets: r.manifestation_targets ? JSON.parse(r.manifestation_targets) : [],
            manifestations: r.manifestations ? JSON.parse(r.manifestations) : [],
            categoriaInvestimento: r.categoria_investimento,
            solicitante: r.solicitante
        }));

        console.log("=== SIMULATION START ===");

        // SCENARIO 1: GED User (Bruno)
        const selectedProfileGED = 'Gerência de Educação (GED)'; // Simulating selection
        console.log(`\n--- User: ${gedUser.name} (${selectedProfileGED}) ---`);
        runFilters(gedUser, selectedProfileGED, requests);

        // SCENARIO 2: Gestor Local (Ana)
        const selectedProfileGestor = 'Gestor Local';
        console.log(`\n--- User: ${gestorUser.name} (${selectedProfileGestor}) ---`);
        runFilters(gestorUser, selectedProfileGestor, requests);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

function runFilters(user, selectedProfile, requests) {
    const linkedUnits = user.linked_units || [];

    requests.forEach(req => {
        console.log(`\nRequest ${req.id} [${req.unit}] (${req.status}):`);

        // 1. SECURITY FILTER
        const isLinkedUnit = linkedUnits.includes(req.unit);
        const isCreator = req.solicitante === user.name;

        // Mock areasEnvolvidas includes/split logic if string
        const areasList = req.areasEnvolvidas ? req.areasEnvolvidas.split(',').map(s => s.trim()) : [];
        const isAreaMatch = req.areaResponsavel === selectedProfile || areasList.includes(selectedProfile);

        // Corporate Visibility
        const isSenaiCorporate = SENAI_CORPORATE_PROFILES.some(p => selectedProfile.includes(p)) && req.entidade === 'SENAI';

        const passesSecurity = isLinkedUnit || isCreator || isAreaMatch || isSenaiCorporate;

        console.log(`  Security: ${passesSecurity ? 'PASS' : 'FAIL'} ` +
            `(Linked: ${isLinkedUnit}, Creator: ${isCreator}, AreaMatch: ${isAreaMatch}, Corporate: ${isSenaiCorporate})`);

        if (!passesSecurity) return;

        // 2. CIENCIA FILTER
        const isCienciaPass = checkCienciaFilter(req, selectedProfile);
        console.log(`  Ciencia View: ${isCienciaPass ? 'VISIBLE' : 'HIDDEN'}`);
    });
}

function checkCienciaFilter(request, selectedProfile) {
    if (request.categoriaInvestimento === 'Manutenção') return false;
    if (request.status === 'Concluído' || request.status === 'Recusada' || request.currentLocation === 'Planejamento') return false;

    const isSenai = request.entidade === 'SENAI';
    const loc = request.currentLocation;

    if (isSenai) {
        if (selectedProfile === 'Gestor Local') {
            console.log(`    -> Override Gestor Local: TRUE`);
            return true;
        }

        if (request.manifestationTargets && request.manifestationTargets.length > 0) {
            const manifestCount = request.manifestations?.filter(m => m.text && m.text.trim().length > 0).length || 0;
            const targetCount = request.manifestationTargets.length;

            if (request.status === 'Em Análise GSO' || request.status === 'Concluído' || request.status === 'Recusada') {
                console.log(`    -> Status Excluded (${request.status})`);
                return false;
            }

            if (manifestCount < targetCount) {
                console.log(`    -> Incomplete Manifestations (${manifestCount}/${targetCount}): TRUE`);
                return true;
            } else {
                console.log(`    -> All Manifested: FALSE`);
                return false;
            }
        }

        const res = loc !== 'Gestão Local';
        console.log(`    -> Fallback Location Check (loc='${loc}'): ${res}`);
        return res;
    }
    return false;
}

run();
