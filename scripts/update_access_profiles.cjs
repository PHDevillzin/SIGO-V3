
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const SENAI_MANAGEMENT_PROFILES = [
    "Gerência de Educação (GED) - SENAI",
    "Gerência de Educação (GED)",
    "Gerência de Infraestrutura e Suprimentos (GIS) - SENAI",
    "Gerência de Infraestrutura e Suprimentos (GIS)",
    "Gerência de Inovação e Tecnologia (GIT) - SENAI",
    "Gerência de Planejamento e Avaliação (GPA) - SENAI",
    "Gerência de Planejamento e Controladoria",
    "Gerência de Relações com o Mercado (GRM) - SENAI"
];

const SESI_MANAGEMENT_PROFILES = [
    "Gerência de Esporte e Lazer - SESI",
    "Gerência de Esporte e Lazer",
    "Gerência de Saúde e Segurança na Indústria - SESI",
    "Gerência Executiva da Cultura - SESI",
    "Gerência Executiva da Educação - SESI"
];

async function updateAccessProfiles() {
    try {
        // Fetch all profiles
        const res = await pool.query('SELECT * FROM profiles');
        const profiles = res.rows;

        for (const profile of profiles) {
            let permissions = profile.permissions || [];
            let updated = false;

            // Check for Manifestation Access (SESI + Gestor Local)
            if (SESI_MANAGEMENT_PROFILES.includes(profile.name) || profile.name === 'Gestor Local') {
                if (!permissions.includes('Menu Solicitações:Manifestação')) {
                    permissions.push('Menu Solicitações:Manifestação');
                    updated = true;
                    console.log(`Adding Manifestação permission to: ${profile.name}`);
                }
            }

            // Check for Science Access (SENAI + Gestor Local)
            if (SENAI_MANAGEMENT_PROFILES.includes(profile.name) || profile.name === 'Gestor Local') {
                if (!permissions.includes('Menu Solicitações:Ciência')) {
                    permissions.push('Menu Solicitações:Ciência');
                    updated = true;
                    console.log(`Adding Ciência permission to: ${profile.name}`);
                }
            }

            if (updated) {
                await pool.query(
                    'UPDATE profiles SET permissions = $1 WHERE id = $2',
                    [JSON.stringify(permissions), profile.id]
                );
                console.log(`Updated permissions for ${profile.name}`);
            }
        }

        console.log("Finished updating access profiles.");

    } catch (err) {
        console.error("Error updating access profiles:", err);
    } finally {
        pool.end();
    }
}

updateAccessProfiles();
