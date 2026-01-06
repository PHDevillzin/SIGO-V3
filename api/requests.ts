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
            const result = await query('SELECT * FROM requests ORDER BY id ASC');
            const requests = result.rows.map(row => ({
                id: row.id,
                criticality: row.criticality,
                unit: row.unit,
                description: row.description,
                status: row.status,
                currentLocation: row.current_location,
                expectedStartDate: row.expected_start_date,
                hasInfo: row.has_info,
                expectedValue: row.expected_value,
                executingUnit: row.executing_unit,
                prazo: row.prazo,
                categoriaInvestimento: row.categoria_investimento,
                entidade: row.entidade,
                ordem: row.ordem,
                tipologia: row.tipologia,
                situacaoProjeto: row.situacao_projeto,
                situacaoObra: row.situacao_obra,
                inicioObra: row.inicio_obra,
                saldoObraPrazo: row.saldo_obra_prazo,
                saldoObraValor: row.saldo_obra_valor,
                gestorLocal: row.gestor_local
            }));
            res.status(200).json(requests);
        } else if (req.method === 'POST') {
             // Handle creation
             const data = req.body;
             // ... insert query ...
             // Not fully implementing POST for this step unless needed. 
             // User asked to MOVE data to DB.
             res.status(200).json({ message: "POST not fully implemented yet" });
        } else if (req.method === 'PUT') {
            // Handle updates (like Reclassification)
            const { ids, updates } = req.body;
            if (Array.isArray(ids) && updates) {
                // Bulk update
                const text = `
                    UPDATE requests 
                    SET 
                        categoria_investimento = COALESCE($2, categoria_investimento),
                        tipologia = COALESCE($3, tipologia)
                        -- Add other fields as needed
                    WHERE id = ANY($1::int[]) 
                    RETURNING *
                `;
                const values = [ids, updates.categoriaInvestimento, updates.tipologia];
                const result = await query(text, values);
                res.status(200).json(result.rows);
            } else {
                 res.status(400).json({ error: "Invalid body for bulk update" });
            }
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
