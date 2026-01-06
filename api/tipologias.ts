import { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';

// Helper to sanitize dates for DB
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

    try {
        if (req.method === 'GET') {
             // List all tipologias
            const result = await query('SELECT * FROM tipologias ORDER BY id ASC');
            return res.status(200).json(result.rows);
        }

         if (req.method === 'POST') {
            const { titulo, descricao, dataInclusao, criadoPor, status } = req.body;
            
            const result = await query(
                `INSERT INTO tipologias (titulo, descricao, data_inclusao, criado_por, status)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [titulo, descricao, sanitizeDate(dataInclusao), criadoPor, status]
            );
            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'PUT') {
            const { id, titulo, descricao, status } = req.body;
            if (!id) return res.status(400).json({ error: 'Missing ID' });
            
            // Allow partial updates
             const result = await query(
                `UPDATE tipologias SET
                    titulo = COALESCE($1, titulo),
                    descricao = COALESCE($2, descricao),
                    status = COALESCE($3, status)
                WHERE id = $4
                RETURNING *`,
                [titulo, descricao, status, id]
            );

             if (result.rows.length === 0) {
                 return res.status(404).json({ error: 'Tipologia not found' });
            }
            return res.status(200).json(result.rows[0]);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
