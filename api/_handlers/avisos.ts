
import { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const { active_for_profile } = req.query;

            if (active_for_profile) {
                 // Logic to fetch active notices for a specific profile (or 'Todos') and current time
                 // Postgres overlap or simple comparison
                 const now = new Date().toISOString();
                 const text = `
                    SELECT * FROM avisos_globais 
                    WHERE status = true 
                    AND data_inicio <= $1 
                    AND data_fim >= $1
                    AND ($2 = ANY(perfis) OR 'Todos' = ANY(perfis) OR perfis IS NULL OR array_length(perfis, 1) = 0)
                 `;
                 // Note: 'Todos' check logic depends on how we store it. If we store explicit profiles, we check intersection.
                 // Sending profile name as $2.
                 // Also handle array overlap if user has multiple profiles?
                 // For now assuming single active profile check or passing multiple?
                 // The query param is singular string usually.
                 
                 const result = await query(text, [now, active_for_profile]);
                 
                 // Map snake_case to camelCase
                 const avisos = result.rows.map(row => ({
                     id: row.id,
                     titulo: row.titulo,
                     descricao: row.descricao,
                     perfis: row.perfis,
                     dataInicio: row.data_inicio,
                     dataFim: row.data_fim,
                     dataInclusao: row.data_inclusao,
                     criadoPor: row.criado_por,
                     editadoPor: row.editado_por,
                     dataAlteracao: row.data_alteracao,
                     responsavel: row.responsavel,
                     status: row.status
                 }));
                 return res.status(200).json(avisos);

            } else {
                // Fetch all for management
                const result = await query('SELECT * FROM avisos_globais ORDER BY data_inclusao DESC');
                const avisos = result.rows.map(row => ({
                    id: row.id,
                    titulo: row.titulo,
                    descricao: row.descricao,
                    perfis: row.perfis,
                    dataInicio: row.data_inicio,
                    dataFim: row.data_fim,
                    dataInclusao: row.data_inclusao,
                    criadoPor: row.criado_por,
                    editadoPor: row.editado_por,
                    dataAlteracao: row.data_alteracao,
                    responsavel: row.responsavel,
                    status: row.status
                }));
                return res.status(200).json(avisos);
            }
        }

        if (req.method === 'POST') {
            const { titulo, descricao, perfis, dataInicio, dataFim, criadoPor, responsavel } = req.body;
            
            const text = `
                INSERT INTO avisos_globais (titulo, descricao, perfis, data_inicio, data_fim, criado_por, responsavel)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const values = [titulo, descricao, perfis, dataInicio, dataFim, criadoPor, responsavel];
            const result = await query(text, values);
            
             const row = result.rows[0];
             const newItem = {
                 id: row.id,
                 titulo: row.titulo,
                 descricao: row.descricao,
                 perfis: row.perfis,
                 dataInicio: row.data_inicio,
                 dataFim: row.data_fim,
                 dataInclusao: row.data_inclusao,
                 criadoPor: row.criado_por,
                 editadoPor: row.editado_por,
                 dataAlteracao: row.data_alteracao,
                 responsavel: row.responsavel,
                 status: row.status
             };

            return res.status(201).json(newItem);
        }

        if (req.method === 'PUT') {
             const { id, titulo, descricao, perfis, dataInicio, dataFim, editadoPor, status } = req.body;
             
             // Dynamic update fields? Or just update all editable ones.
             const text = `
                UPDATE avisos_globais
                SET titulo = $1, descricao = $2, perfis = $3, data_inicio = $4, data_fim = $5, editado_por = $6, data_alteracao = NOW(), status = $7
                WHERE id = $8
                RETURNING *
             `;
             const values = [titulo, descricao, perfis, dataInicio, dataFim, editadoPor, status, id];
             const result = await query(text, values);
             
             if (result.rows.length === 0) {
                 return res.status(404).json({ error: 'Aviso not found' });
             }

             const row = result.rows[0];
             const updatedItem = {
                 id: row.id,
                 titulo: row.titulo,
                 descricao: row.descricao,
                 perfis: row.perfis,
                 dataInicio: row.data_inicio,
                 dataFim: row.data_fim,
                 dataInclusao: row.data_inclusao,
                 criadoPor: row.criado_por,
                 editadoPor: row.editado_por,
                 dataAlteracao: row.data_alteracao,
                 responsavel: row.responsavel,
                 status: row.status
             };

             return res.status(200).json(updatedItem);
        }
        
        if (req.method === 'PATCH') {
            // For separate status toggle if needed, or stick to PUT
             const { id, status } = req.body;
             const text = 'UPDATE avisos_globais SET status = $1 WHERE id = $2 RETURNING *';
             const result = await query(text, [status, id]);
             return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
             const { id } = req.query;
             await query('DELETE FROM avisos_globais WHERE id = $1', [id]);
             return res.status(204).end();
        }

        res.status(405).end();
    } catch (error: any) {
        console.error('Error in avisos API:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
