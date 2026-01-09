import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

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
        // GET: List Profiles
        if (req.method === 'GET') {
            const result = await query(`
                SELECT 
                    id, 
                    name, 
                    permissions, 
                    category, 
                    is_active as "isActive",
                    created_at as "createdAt",
                    created_by as "createdBy",
                    updated_at as "updatedAt",
                    updated_by as "updatedBy",
                    last_action as "lastAction"
                FROM profiles 
                ORDER BY name ASC
            `);
            return res.status(200).json(result.rows);
        }

        // POST: Create Profile
        if (req.method === 'POST') {
            const { name, permissions, category, user } = req.body;

            if (!name) return res.status(400).json({ error: 'Name required' });

            const result = await query(
                `INSERT INTO profiles (
                    name, 
                    permissions, 
                    category, 
                    is_active, 
                    created_at, 
                    created_by,
                    last_action
                ) VALUES ($1, $2, $3, true, NOW(), $4, 'Cadastro') 
                RETURNING 
                    id, 
                    name, 
                    permissions, 
                    category, 
                    is_active as "isActive", 
                    created_at as "createdAt", 
                    created_by as "createdBy", 
                    updated_at as "updatedAt", 
                    updated_by as "updatedBy", 
                    last_action as "lastAction"`,
                [name, JSON.stringify(permissions || []), category || 'GERAL', user || 'Sistema']
            );

            return res.status(201).json(result.rows[0]);
        }

        // PUT: Update Profile
        if (req.method === 'PUT') {
            const { id, name, permissions, isActive, user } = req.body;

            if (!id) return res.status(400).json({ error: 'ID required' });

            // Fetch current state to determine action
            const currentRes = await query('SELECT is_active FROM profiles WHERE id = $1', [id]);
            if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });

            const currentActive = currentRes.rows[0].is_active;

            let action = 'Edição';
            if (typeof isActive === 'boolean') {
                if (isActive && !currentActive) action = 'Reativação';
                else if (!isActive && currentActive) action = 'Inativação';
            }

            const result = await query(
                `UPDATE profiles SET
                    name = COALESCE($1, name),
                    permissions = COALESCE($2, permissions),
                    is_active = COALESCE($3, is_active),
                    updated_at = NOW(),
                    updated_by = $4,
                    last_action = $5
                WHERE id = $6
                RETURNING 
                    id, 
                    name, 
                    permissions, 
                    category, 
                    is_active as "isActive", 
                    created_at as "createdAt", 
                    created_by as "createdBy", 
                    updated_at as "updatedAt", 
                    updated_by as "updatedBy", 
                    last_action as "lastAction"`,
                [
                    name,
                    permissions ? JSON.stringify(permissions) : null,
                    isActive,
                    user || 'Sistema',
                    action,
                    id
                ]
            );

            return res.status(200).json(result.rows[0]);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await pool.end();
    }
}
