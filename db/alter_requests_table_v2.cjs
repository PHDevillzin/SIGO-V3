
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to database.');

    const queries = [
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS solicitante VARCHAR(100);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS gerencia VARCHAR(100);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS objetivo TEXT;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS expectativa_resultados TEXT;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS justificativa TEXT;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS resumo_servicos TEXT;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS aumento TEXT[];",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS necessidades TEXT[];",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS servicos_necessarios TEXT[];",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS servicos_especificos TEXT[];",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS area_intervencao NUMERIC;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS data_utilizacao DATE;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS possui_projeto VARCHAR(50);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS possui_laudo VARCHAR(50);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS tem_autorizacao VARCHAR(50);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS realizou_consulta VARCHAR(50);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS houve_notificacao VARCHAR(50);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS referencia VARCHAR(100);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS area_responsavel VARCHAR(100);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS areas_envolvidas VARCHAR(255);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS programa_necessidades TEXT;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS instalacoes_sesi_senai TEXT;",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS local_obra VARCHAR(50);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS atividade VARCHAR(100);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS local_nome VARCHAR(100);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS problemas_nao_atendida VARCHAR(255);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS prazo_acao VARCHAR(50);",
      "ALTER TABLE requests ADD COLUMN IF NOT EXISTS probabilidade_evolucao VARCHAR(50);",
    ];

    for (const query of queries) {
      console.log(`Executing: ${query}`);
      await client.query(query);
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
