require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateCategories() {
    const client = await pool.connect();
    try {
        console.log("--- STARTING PROFILE CATEGORY UPDATE ---");

        // 1. Update SENAI profiles
        const resSenai = await client.query(`
            UPDATE profiles 
            SET category = 'SENAI' 
            WHERE name ILIKE '%Senai%'
            RETURNING id, name, category;
        `);
        console.log(`Updated ${resSenai.rowCount} SENAI profiles:`);
        resSenai.rows.forEach(r => console.log(` - ${r.name}: ${r.category}`));

        // 2. Update SESI profiles
        const resSesi = await client.query(`
            UPDATE profiles 
            SET category = 'SESI' 
            WHERE name ILIKE '%Sesi%'
            RETURNING id, name, category;
        `);
        console.log(`Updated ${resSesi.rowCount} SESI profiles:`);
        resSesi.rows.forEach(r => console.log(` - ${r.name}: ${r.category}`));

        // 3. Update Corporate/GSO/Infra to CORPORATIVO (if not already)
        // explicitly covering known corporate profiles to ensure they don't get missed if logic changes
        const resCorp = await client.query(`
            UPDATE profiles 
            SET category = 'CORPORATIVO' 
            WHERE (name ILIKE '%GSO%' OR name ILIKE '%Corporativa%' OR name ILIKE '%Infraestrutura%' OR name ILIKE '%Suaúde%' OR name ILIKE '%Segurança%' OR name ILIKE '%Tecnologia%')
            AND category IS DISTINCT FROM 'SENAI' -- Don't overwrite if it was just set (unlikely for these names)
            AND category IS DISTINCT FROM 'SESI'
            RETURNING id, name, category;
        `);
        console.log(`Updated ${resCorp.rowCount} CORPORATIVO profiles:`);
        resCorp.rows.forEach(r => console.log(` - ${r.name}: ${r.category}`));

        // 4. Update 'Gestor Local' and 'Solicitação Unidade' to 'GERAL' or 'CORPORATIVO'
        // 'Solicitação Unidade' -> Likely Corporate/Geral (Category 1 or 5)
        // 'Gestor Local' -> Likely Corporate/Geral (Category 2 if management)
        // Let's set them to 'CORPORATIVO' so they fall into Group 1/2 as generic roles
        const resGeneric = await client.query(`
             UPDATE profiles
             SET category = 'CORPORATIVO'
             WHERE name IN ('Gestor Local', 'Solicitação Unidade')
             RETURNING id, name, category;
        `);
        console.log(`Updated ${resGeneric.rowCount} Generic profiles to CORPORATIVO:`);
        resGeneric.rows.forEach(r => console.log(` - ${r.name}: ${r.category}`));

    } catch (err) {
        console.error('Error executing update', err);
    } finally {
        client.release();
        await pool.end();
    }
}

updateCategories();
