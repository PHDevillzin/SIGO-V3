import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

// Simple interface for User to help with type checking inside the handler
interface UserData {
    nif: string;
    name: string;
    email: string;
    unidade?: string;
    profile?: string;
    sigo_profiles?: string[];
    linked_units?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
        if (req.method === 'GET') {
            const { nif } = req.query;
            
            if (nif) {
                // Get single user
                const result = await query('SELECT * FROM users WHERE nif = $1', [nif as string]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                return res.status(200).json(result.rows[0]);
            } else {
                // List all users
                const result = await query('SELECT * FROM users ORDER BY name ASC');
                return res.status(200).json(result.rows);
            }
        }

        if (req.method === 'POST') {
            const { nif, name, email, unidade, profile, sigo_profiles, linked_units } = req.body as UserData;
            
            if (!nif || !name) {
                return res.status(400).json({ error: 'Missing required fields: nif, name' });
            }

            const result = await query(
                `INSERT INTO users (nif, name, email, unidade, profile, sigo_profiles, linked_units, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                 RETURNING *`,
                [nif, name, email, unidade, profile, sigo_profiles, linked_units]
            );
            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'PUT') {
            const { nif, name, email, unidade, profile, sigo_profiles, linked_units, id } = req.body as any;
            
            if (!id && !nif) {
                return res.status(400).json({ error: 'Missing user ID or NIF' });
            }

            // Prefer ID for updates but allow NIF
            let result;
            if (id) {
                result = await query(
                    `UPDATE users 
                     SET nif = COALESCE($1, nif), 
                         name = COALESCE($2, name), 
                         email = COALESCE($3, email), 
                         unidade = COALESCE($4, unidade), 
                         profile = COALESCE($5, profile),
                         sigo_profiles = COALESCE($6, sigo_profiles),
                         linked_units = COALESCE($7, linked_units),
                         updated_at = NOW()
                     WHERE id = $8
                     RETURNING *`,
                    [nif, name, email, unidade, profile, sigo_profiles, linked_units, id]
                );
            } else {
                 result = await query(
                    `UPDATE users 
                     SET name = COALESCE($2, name), 
                         email = COALESCE($3, email), 
                         unidade = COALESCE($4, unidade), 
                         profile = COALESCE($5, profile),
                         sigo_profiles = COALESCE($6, sigo_profiles),
                         linked_units = COALESCE($7, linked_units),
                         updated_at = NOW()
                     WHERE nif = $1
                     RETURNING *`,
                    [nif, name, email, unidade, profile, sigo_profiles, linked_units]
                );
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id, nif } = req.query;
            
            if (!id && !nif) {
                return res.status(400).json({ error: 'Missing user ID or NIF' });
            }

            let result;
            if (id) {
                result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id as string]);
            } else {
                result = await query('DELETE FROM users WHERE nif = $1 RETURNING id', [nif as string]);
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json({ message: 'User deleted successfully' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
