import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

function sanitizeDate(date: string | null | undefined): string | null {
    return date || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
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
            const result = await query('SELECT * FROM tipo_locais ORDER BY id ASC');
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { descricao, dataInclusao, criadoPor, status } = req.body;
            
            const result = await query(
                `INSERT INTO tipo_locais (descricao, data_inclusao, criado_por, status)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [descricao, sanitizeDate(dataInclusao), criadoPor, status]
            );
            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'PUT') {
            const { id, descricao, status } = req.body;
            if (!id) return res.status(400).json({ error: 'Missing ID' });
            
            const result = await query(
                `UPDATE tipo_locais SET
                    descricao = COALESCE($1, descricao),
                    status = COALESCE($2, status)
                WHERE id = $3
                RETURNING *`,
                [descricao, status, id]
            );

             if (result.rows.length === 0) {
                 return res.status(404).json({ error: 'Tipo Local not found' });
            }
            return res.status(200).json(result.rows[0]);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
