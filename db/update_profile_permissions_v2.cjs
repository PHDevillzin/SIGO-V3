const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const profilesToUpsert = [
  {
    id: 'admin_sys',
    name: 'Administração do sistema',
    permissions: ['all']
  },
  {
    id: 'admin_gso',
    name: 'Administrador GSO',
    permissions: [
        'home', 
        'configuracoes', 
        'gestao_acesso', 
        'cadastro_tipo_local', 
        'cadastro_unidades', 
        'painel_criticidade', 
        'gerenciador_arquivos', 
        'avisos_globais', 
        'notificacoes_requisitos', 
        'cadastro_periodos', 
        'tipologias'
    ]
  },
  {
    id: '3', // Updating 'Solicitação Unidade'
    name: 'Unidade Solicitante',
    permissions: ['home', 'nova_unidade', 'solicitacoes']
  },
  {
    id: '7', // Updating 'Gestor Local'
    name: 'Gestor Local',
    permissions: ['home', 'nova_unidade', 'aprovacao', 'solicitacoes', 'configuracoes', 'gestao_acesso']
  },
  {
    id: 'area_fim_solicitante', // New
    name: 'Área Fim (Solicitante Estratégico)',
    permissions: ['home', 'nova_estrategica', 'nova_sede', 'solicitacoes']
  },
  {
    id: 'area_fim_aprovador', // New
    name: 'Área Fim (Aprovador)',
    permissions: ['home', 'aprovacao', 'solicitacoes', 'configuracoes', 'gestao_acesso']
  },
  {
    id: '2', // Updating 'Alta Administração Senai'
    name: 'Alta Administração',
    permissions: ['home', 'solicitacoes', 'aprovacao']
  },
  {
    id: 'sede_solicitante', // New
    name: 'Sede Solicitante',
    permissions: ['home', 'nova_sede', 'solicitacoes']
  },
  {
    id: '5', // Updating 'Diretoria Corporativa'
    name: 'Diretoria Corporativa',
    permissions: ['home', 'solicitacoes', 'aprovacao']
  },
  {
    id: '4', // Updating 'Gestor GSO'
    name: 'Gestor (GSO)',
    permissions: ['home', 'solicitacoes']
  },
  {
    id: 'planejamento_gso', // New
    name: 'Planejamento (GSO)',
    permissions: [
        'home', 
        'solicitacoes', 
        'manutencao', 
        'gerenciamento', 
        'planejamento', 
        'plurianual', 
        'solicitacoes_reclassificacao'
    ]
  }
];

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const profile of profilesToUpsert) {
      console.log(`Upserting profile: ${profile.name}`);
      // Use standard INSERT ON CONFLICT DO UPDATE
      // Note: "id" column type might vary (serial vs text).
      // Assuming 'id' column is text or compatible for the new string IDs. 
      // Existing IDs 2, 3, etc might be integers or strings in DB. 
      // 'profiles' table definition: id is likely text/varchar given 'admin_sys'.
      
      const query = `
        INSERT INTO profiles (id, name, permissions)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          permissions = EXCLUDED.permissions;
      `;
      await client.query(query, [profile.id, profile.name, profile.permissions]);
    }

    await client.query('COMMIT');
    console.log('Profile permissions updated successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating profiles:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
