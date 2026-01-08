const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const profilesData = [
    // GERAL - ADMINS
    { name: 'Administrador GSO', category: 'GERAL', permissions: ['Home', 'Configurações:Gestão de acesso', 'Configurações:Tipolocal', 'Configurações:Unidades', 'Configurações:Criticidade', 'Configurações:Arquivos', 'Configurações:Gerenciamento de Avisos', 'Configurações:Notificações', 'Configurações:Periodo de solicitação', 'Configurações:Tipologia'] },
    { name: 'Administrador do sistema', category: 'GERAL', permissions: ['*'] }, // * = All Access

    // GERAL - OTHERS
    { name: 'Unidade Solicitante', category: 'GERAL', permissions: ['Home', 'Abrir Solicitações:Unidade', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gestor Local', category: 'GERAL', permissions: ['Home', 'Abrir Solicitações:Unidade', 'Menu Solicitações:Aprovação', 'Menu Solicitações:Gerais (PDF + Ciência)', 'Configurações:Gestão de acesso'] },
    { name: 'Alta Administração', category: 'GERAL', permissions: ['Home', 'Menu Solicitações:Gerais', 'Menu Solicitações:Aprovação', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Sede Solicitante', category: 'GERAL', permissions: ['Home', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Diretoria Corporativa', category: 'GERAL', permissions: ['Home', 'Menu Solicitações:Gerais', 'Menu Solicitações:Aprovação', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gestor (GSO)', category: 'GERAL', permissions: ['Home', 'Menu Solicitações:Gerais', 'Menu Solicitações:Manutenção', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Planejamento (GSO)', category: 'GERAL', permissions: ['Home', 'Menu Solicitações:Gerais', 'Menu Solicitações:Manutenção', 'Gerenciamento:Planejamento', 'Gerenciamento:Plurianual', 'Menu Solicitações:Gerais (PDF)', 'Menu Solicitações:Reclassificação'] },

    // SENAI
    { name: 'Gerência de Educação (GED)', category: 'SENAI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Infraestrutura e Suprimentos (GIS)', category: 'SENAI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Inovação e Tecnologia (GIT)', category: 'SENAI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Planejamento e Avaliação (GPA)', category: 'SENAI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Relações com o Mercado (GRM)', category: 'SENAI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },

    // SESI
    { name: 'Gerência de Esporte e Lazer', category: 'SESI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Saúde e Segurança na Indústria', category: 'SESI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência Executiva da Cultura', category: 'SESI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência Executiva da Educação', category: 'SESI', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },

    // CORPORATIVO
    { name: 'Gerência de Compras', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Comunicação e Marketing Institucional', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Facilities', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência de Planejamento e Controladoria', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência Sênior Contábil e Financeira', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência Sênior de Obras', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência Sênior de Recursos Humanos', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência Sênior de Tecnologia da Informação', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] },
    { name: 'Gerência Sênior Jurídica e Editora', category: 'CORPORATIVO', permissions: ['Home', 'Abrir Solicitações:Estratégica', 'Abrir Solicitações:Sede', 'Menu Solicitações:Gerais (PDF)'] }
];

async function run() {
    await client.connect();
    try {
        console.log('Connected to database.');

        // 2. DROP and RECREATE Tables
        console.log('Recreating tables...');

        await client.query("DROP TABLE IF EXISTS user_access");
        await client.query("DROP TABLE IF EXISTS profiles");

        // Profiles: ID is now VARCHAR (slug)
        await client.query(`
            CREATE TABLE profiles (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(50) DEFAULT 'GERAL',
                permissions JSONB DEFAULT '[]'::jsonb
            )
        `);

        // User Access: Links User, Profile, Unit
        await client.query(`
            CREATE TABLE user_access (
                id SERIAL PRIMARY KEY,
                user_nif VARCHAR(255) REFERENCES users(nif) ON DELETE CASCADE,
                profile_id VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE,
                unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE
            )
        `);

        // 3. Insert New Profiles
        console.log('Inserting new profiles...');

        const slugify = (text) => text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '_')
            .replace(/^-+/, '')
            .replace(/-+$/, '');

        for (const p of profilesData) {
            const id = slugify(p.name);
            await client.query(
                "INSERT INTO profiles (id, name, category, permissions) VALUES ($1, $2, $3, $4)",
                [id, p.name, p.category, JSON.stringify(p.permissions)]
            );
        }
        console.log(`Inserted ${profilesData.length} profiles.`);

        // 4. Restore Admin Access
        console.log('Restoring Admin User (SS0000001)...');

        const adminProfileId = slugify('Administrador do sistema'); // We know this will be the ID
        const nif = 'SS0000001';

        // Check if user exists, if not, upsert him (safety check)
        // (Assuming restore-admin-user.cjs logic, simplified here since user should exist)

        // Grant Access
        await client.query(
            "INSERT INTO user_access (user_nif, profile_id, unit_id) VALUES ($1, $2, NULL)",
            [nif, adminProfileId]
        );
        console.log(`Restored access for ${nif} as 'Administrador do sistema' (ID: ${adminProfileId})`);

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
        console.log('Disconnected.');
    }
}

run();
