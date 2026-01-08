import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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

    try {
        if (req.method === 'GET') {
            const client = await pool.connect();
            try {
                const result = await client.query('SELECT * FROM profiles ORDER BY id ASC');
                return res.status(200).json(result.rows);
            } finally {
                client.release();
            }
        }

        if (req.method === 'POST') {
            const { id, name, permissions, category } = req.body;

            if (!name) return res.status(400).json({ error: 'Name is required' });

            const client = await pool.connect();
            try {
                // If ID is provided, it's likely an edit (or we generate a slug)
                // The frontend generates ID as Date.now() for new, or passes existing ID.
                // We should probably rely on slug generation here if new, or respect passed ID if existing.

                // Let's check if exists
                let targetId = id;
                const check = await client.query('SELECT id FROM profiles WHERE id = $1', [targetId]);

                if (check.rows.length > 0) {
                    // Update
                    await client.query(
                        'UPDATE profiles SET name = $1, permissions = $2 WHERE id = $3',
                        [name, JSON.stringify(permissions), targetId]
                    );
                } else {
                    // Insert
                    // If ID looks like timestamp (numeric), maybe regenerate slug? 
                    // Or trust frontend? The frontend uses Date.now(). Let's slugify for consistency if it looks numeric.
                    if (!targetId || /^\d+$/.test(targetId)) {
                        targetId = name.toString().toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, '_')
                            .replace(/[^a-z0-9_]+/g, '');
                    }

                    await client.query(
                        'INSERT INTO profiles (id, name, permissions, category) VALUES ($1, $2, $3, $4)',
                        [targetId, name, JSON.stringify(permissions), category || 'GERAL']
                    );
                }

                return res.status(200).json({ success: true, id: targetId });

            } finally {
                client.release();
            }
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
