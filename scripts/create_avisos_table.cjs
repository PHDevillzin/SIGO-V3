
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTable() {
  try {
    const queryText = `
      CREATE TABLE IF NOT EXISTS avisos_globais (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        perfis TEXT[],
        data_inicio TIMESTAMP,
        data_fim TIMESTAMP,
        data_inclusao TIMESTAMP DEFAULT NOW(),
        criado_por TEXT,
        editado_por TEXT,
        data_alteracao TIMESTAMP,
        responsavel TEXT,
        status BOOLEAN DEFAULT TRUE
      );
    `;
    
    await pool.query(queryText);
    console.log("Table 'avisos_globais' created or already exists.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    pool.end();
  }
}

createTable();
