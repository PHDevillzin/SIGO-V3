import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    try {
        if (req.method === 'GET') {
            const result = await query('SELECT * FROM tipo_locais ORDER BY id DESC');
            const data = result.rows.map(row => ({
                id: row.id,
                descricao: row.descricao,
                dataInclusao: row.data_inclusao,
                criadoPor: row.criado_por,
                status: row.status
            }));
            res.status(200).json(data);
        } else if (req.method === 'POST') {
            const { descricao, dataInclusao, criadoPor, status } = req.body;
            const result = await query(
                'INSERT INTO tipo_locais (descricao, data_inclusao, criado_por, status) VALUES ($1, $2, $3, $4) RETURNING *',
                [descricao, dataInclusao, criadoPor, status]
            );
            res.status(201).json(result.rows[0]);
        } else if (req.method === 'PUT') {
             const { id, descricao, status } = req.body;
             let text = 'UPDATE tipo_locais SET ';
             const params = [];
             let idx = 1;
             
             if (descricao !== undefined) {
                 text += `descricao = $${idx++}, `;
                 params.push(descricao);
             }
             if (status !== undefined) {
                 text += `status = $${idx++}, `;
                 params.push(status);
             }
             text = text.slice(0, -2);
             text += ` WHERE id = $${idx} RETURNING *`;
             params.push(id);
             
             const result = await query(text, params);
             res.status(200).json(result.rows[0]);
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
