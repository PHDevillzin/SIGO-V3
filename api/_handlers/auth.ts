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

            if (user.is_active === false) {
                return res.status(403).json({ error: 'Acesso negado: Usuário inativo. Contate o administrador.' });
            }

            // 2. Check Permissions in `user_access` table
            // Fetch all profile_ids, unit_ids, AND permissions associated with this user
            // 2. Check Permissions in `user_access` table
            // Fetch all profile_ids, unit_ids, AND permissions associated with this user
            const permissionQuery = `
                SELECT 
                    ua.profile_id, 
                    p.name as profile_name,
                    p.permissions,
                    p.category,
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
                return res.status(403).json({ error: 'Acesso negado: Usuário sem perfil associado.' });
            }

            // NEW LOGIC: Multi-profile additive permissions.
            // We do NOT filter out profiles without units. If a profile is assigned, its permissions count.

            // 4. Success - Return Data
            // Aggregate Profiles and Units
            const uniqueProfileIds = [...new Set(accessRows.map(r => r.profile_id))];

            // For units, we only take those that actually have a unit assigned
            const uniqueUnitNames = [...new Set(accessRows.filter(r => r.unit_id).map(r => r.unit_name).filter(Boolean))];

            // Aggregate Permissions (Screens)
            // Flatten all permission arrays from ALL assigned profiles (accessRows)
            let aggregatedPermissions: string[] = [];
            accessRows.forEach(row => {
                if (row.permissions && Array.isArray(row.permissions)) {
                    aggregatedPermissions.push(...row.permissions);
                }
            });
            aggregatedPermissions = [...new Set(aggregatedPermissions)]; // Unique

            // If ANY profile has 'all', the user has 'all'
            if (aggregatedPermissions.includes('all')) {
                aggregatedPermissions = ['all'];
            }

            return res.status(200).json({
                user: {
                    id: user.id,
                    nif: user.nif,
                    name: user.name,
                    email: user.email,
                    sigoProfiles: uniqueProfileIds,
                    linkedUnits: uniqueUnitNames,
                    permissions: aggregatedPermissions, // Used for Menu Filtering
                    isApproverStrategic: user.is_approver_strategic,
                    isApproverSede: user.is_approver_sede,
                    isRequesterStrategic: user.is_requester_strategic,
                    isRequesterSede: user.is_requester_sede,
                    isApprover: user.is_approver,
                    isRequester: user.is_requester
                },
                // Legacy compat: send first profile as "main" if needed
                profile: {
                    id: uniqueProfileIds[0],
                    name: accessRows.find(r => r.profile_id === uniqueProfileIds[0])?.profile_name
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
