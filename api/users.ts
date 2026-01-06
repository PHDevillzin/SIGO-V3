import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const result = await query('SELECT * FROM users ORDER BY name ASC');
            // Map snake_case to camelCase
            const users = result.rows.map(row => ({
                id: row.id,
                nif: row.nif,
                name: row.name,
                email: row.email,
                unidade: row.unidade,
                profile: row.profile,
                createdBy: row.created_by,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                sigoProfiles: row.sigo_profiles,
                linkedUnits: row.linked_units,
                registrationDate: row.registration_date
            }));
            res.status(200).json(users);
        } else if (req.method === 'POST') {
            const { nif, name, email, unidade, profile, sigoProfiles, linkedUnits, registrationDate } = req.body;
            // Upsert based on NIF
            const text = `
                INSERT INTO users (nif, name, email, unidade, profile, sigo_profiles, linked_units, registration_date, created_by, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Sistema', NOW())
                ON CONFLICT (nif) 
                DO UPDATE SET 
                    sigo_profiles = EXCLUDED.sigo_profiles,
                    linked_units = EXCLUDED.linked_units,
                    registration_date = EXCLUDED.registration_date,
                    updated_at = NOW()
                RETURNING *
            `;
            const values = [nif, name, email, unidade, profile, sigoProfiles, linkedUnits, registrationDate];
            const result = await query(text, values);
            res.status(201).json(result.rows[0]);

        } else if (req.method === 'DELETE') {
             const { nif } = req.query;
             if (!nif) {
                 res.status(400).json({ error: 'NIF is required' });
                 return;
             }
             // We won't actually delete the user row if we want to keep them as "Available", 
             // but per the logic in AccessManagementScreen, "delete" clears their access. 
             // However, for the database state, maybe we just clear the sigoProfiles/linkedUnits 
             // OR strictly follow the UI logic: "remover e agora está disponível para novo cadastro".
             
             // If we DELETE the row, they are gone from "Users Available" too unless we have a separate "Source Users" table vs "Registered Users".
             // The UI has "Source CSV" vs "Registered".
             // The "Source CSV" seems hardcoded. 
             // IF I move everything to DB, I should probably have all users in the DB, and "Registered" means they have Access Profiles.
             
             // Logical delete (clear registration info)
             const text = `
                UPDATE users 
                SET sigo_profiles = NULL, linked_units = NULL, registration_date = NULL, updated_at = NOW()
                WHERE nif = $1
                RETURNING *
             `;
             const result = await query(text, [nif]);
             res.status(200).json(result.rows[0]);
             
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
