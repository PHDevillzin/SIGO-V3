require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrateRequests() {
    const client = await pool.connect();
    try {
        console.log("Migrating requests table...");

        const columnsToAdd = [
            "solicitante VARCHAR(255)",
            "gerencia VARCHAR(255)",
            "objetivo TEXT",
            "expectativa_resultados TEXT",
            "justificativa TEXT",
            "resumo_servicos TEXT",
            "aumento TEXT[]",
            "necessidades TEXT[]",
            "servicos_necessarios TEXT[]",
            "servicos_especificos TEXT[]",
            "area_intervencao VARCHAR(100)",
            "data_utilizacao DATE",
            "possui_projeto VARCHAR(50)",
            "possui_laudo VARCHAR(50)",
            "tem_autorizacao VARCHAR(50)",
            "realizou_consulta VARCHAR(50)",
            "houve_notificacao VARCHAR(50)",
            "referencia VARCHAR(255)",
            "area_responsavel VARCHAR(255)",
            "areas_envolvidas TEXT",
            "programa_necessidades TEXT",
            "instalacoes_sesi_senai TEXT",
            "local_obra VARCHAR(255)",
            "atividade VARCHAR(255)",
            "local_nome VARCHAR(255)",
            "problemas_nao_atendida VARCHAR(255)",
            "prazo_acao VARCHAR(50)",
            "probabilidade_evolucao VARCHAR(50)",
            "observacao TEXT"
        ];

        for (const colDef of columnsToAdd) {
            const colName = colDef.split(' ')[0];
            // Check if column exists
            const res = await client.query(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'requests' AND column_name = $1",
                [colName]
            );

            if (res.rows.length === 0) {
                console.log(`Adding column: ${colName}`);
                await client.query(`ALTER TABLE requests ADD COLUMN ${colDef}`);
            } else {
                console.log(`Column ${colName} already exists.`);
            }
        }

        console.log("Migration complete.");

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrateRequests();
