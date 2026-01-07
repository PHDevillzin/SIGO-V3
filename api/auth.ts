import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Inline DB Connection (Standard Pattern for this project)
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const query = async (text: string, params: any[] = []) => {
        const client = await pool.connect();
        try {
            return await client.query(text, params);
        } finally {
            client.release();
        }
    };

    try {
        // LOGIN
        if (req.method === 'POST') {
            const { nif, password } = req.body;

            if (!nif || !password) {
                return res.status(400).json({ error: 'NIF and Password are required' });
            }

            // 1. Check User Credentials AND NIF/Password
            const userRes = await query('SELECT * FROM users WHERE nif = $1 AND password = $2', [nif, password]);
            
            if (userRes.rows.length === 0) {
                 return res.status(401).json({ error: 'NIF ou senha incorretos.' });
            }

            const user = userRes.rows[0];

            // 2. Check Permissions in `user_access` table
            // Fetch all profile_ids and unit_ids associated with this user
            const permissionQuery = `
                SELECT 
                    ua.profile_id, 
                    p.name as profile_name,
                    ua.unit_id,
                    u.unidade as unit_name
                FROM user_access ua
                LEFT JOIN profiles p ON ua.profile_id = p.id
                LEFT JOIN units u ON ua.unit_id = u.id
                WHERE ua.user_nif = $1
            `;
            
            const permRes = await query(permissionQuery, [user.nif]);
            const accessRows = permRes.rows;

            // Step 2 Requirement: Verify if user has a profile registered
            if (accessRows.length === 0) {
                // FALLBACK for Legacy Admin during migration phase (if not yet in user_access)
                if (user.sigo_profiles?.includes('admin_sys') || user.profile === 'Administração do sistema') {
                     // Pass through as Legacy Admin
                     return res.status(200).json({
                        user: { 
                            ...user, 
                            sigoProfiles: ['admin_sys'], 
                            linkedUnits: [] 
                        },
                        profile: { id: 'admin_sys', name: 'Administração do sistema' }, // Legacy format
                        redirect: '/dashboard'
                    });
                }
                return res.status(403).json({ error: 'Acesso negado: Usuário sem perfil associado.' });
            }

            // Step 3 Requirement: Check unit association
            // "Para perfil que não tem unidade, pular essa etapa" -> implicitly means Admin
            // "Verificar se o usuário possui uma unidade cadastrada"
            
            // We check if there is ANY valid access row. 
            // A valid access row is either:
            // - Has a Profile AND a Unit
            // - Has a Profile that is "Global" (doesn't need unit). 
            // Assuming 'admin_sys' is the only global one for now based on context.
            
            const validAccess = accessRows.filter(row => {
                const isAdmin = row.profile_id === 'admin_sys' || row.profile_name === 'Administração do sistema';
                const hasUnit = !!row.unit_id;
                return hasUnit || isAdmin; 
            });

            if (validAccess.length === 0) {
                 return res.status(403).json({ error: 'Acesso negado: Usuário possui perfil mas nenhuma unidade vinculada (e não é Administrador).' });
            }

            // 4. Success - Return Data
            // Aggregate Profiles and Units for Frontend
            const uniqueProfileIds = [...new Set(validAccess.map(r => r.profile_id))];
             // We return unit NAMES for frontend display logic, or IDs if preferred. keeping names to match current logic.
            const uniqueUnitNames = [...new Set(validAccess.map(r => r.unit_name).filter(Boolean))]; 

            return res.status(200).json({
                user: {
                    id: user.id,
                    nif: user.nif,
                    name: user.name,
                    email: user.email,
                    sigoProfiles: uniqueProfileIds,
                    linkedUnits: uniqueUnitNames
                },
                // Legacy compat: send first profile as "main" if needed
                profile: { 
                    id: uniqueProfileIds[0], 
                    name: validAccess.find(r => r.profile_id === uniqueProfileIds[0])?.profile_name 
                }
            });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Auth API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
