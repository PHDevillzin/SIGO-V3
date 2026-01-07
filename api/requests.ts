import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

// Helper to sanitize dates for DB
function sanitizeDate(date: string | null | undefined): string | null {
    return date || null;
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
            const { id } = req.query;
            
            if (id) {
                const result = await query('SELECT * FROM requests WHERE id = $1', [id as string]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Request not found' });
                }
                return res.status(200).json(result.rows[0]);
            } else {
                const result = await query('SELECT * FROM requests ORDER BY id ASC');
                return res.status(200).json(result.rows);
            }
        }

        if (req.method === 'POST') {
            const body = req.body;
            // Basic validation
            if (!body.description) { // Simplified validation
                return res.status(400).json({ error: 'Description is required' });
            }

            const result = await query(
                `INSERT INTO requests (
                    criticality, unit, description, status, current_location, 
                    gestor_local, expected_start_date, has_info, expected_value, 
                    executing_unit, prazo, categoria_investimento, entidade, 
                    ordem, situacao_projeto, situacao_obra, inicio_obra, 
                    saldo_obra_prazo, saldo_obra_valor, tipologia
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                RETURNING *`,
                [
                    body.criticality, body.unit, body.description, body.status, body.currentLocation,
                    body.gestorLocal, sanitizeDate(body.expectedStartDate), body.hasInfo, body.expectedValue,
                    body.executingUnit, body.prazo, body.categoriaInvestimento, body.entidade,
                    body.ordem, body.situacaoProjeto, body.situacaoObra, sanitizeDate(body.inicioObra),
                    body.saldoObraPrazo, body.saldoObraValor, body.tipologia
                ]
            );
            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'PUT') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'Missing ID' });
            
            const body = req.body;

             const result = await query(
                `UPDATE requests SET
                    criticality = $1, unit = $2, description = $3, status = $4, current_location = $5, 
                    gestor_local = $6, expected_start_date = $7, has_info = $8, expected_value = $9, 
                    executing_unit = $10, prazo = $11, categoria_investimento = $12, entidade = $13, 
                    ordem = $14, situacao_projeto = $15, situacao_obra = $16, inicio_obra = $17, 
                    saldo_obra_prazo = $18, saldo_obra_valor = $19, tipologia = $20
                WHERE id = $21
                RETURNING *`,
                [
                    body.criticality, body.unit, body.description, body.status, body.currentLocation,
                    body.gestorLocal, sanitizeDate(body.expectedStartDate), body.hasInfo, body.expectedValue,
                    body.executingUnit, body.prazo, body.categoriaInvestimento, body.entidade,
                    body.ordem, body.situacaoProjeto, body.situacaoObra, sanitizeDate(body.inicioObra),
                    body.saldoObraPrazo, body.saldoObraValor, body.tipologia,
                    id
                ]
            );
            
            if (result.rows.length === 0) {
                 return res.status(404).json({ error: 'Request not found' });
            }
            return res.status(200).json(result.rows[0]);
        }
        
        if (req.method === 'DELETE') {
             const { id } = req.query;
             if (!id) return res.status(400).json({ error: 'Missing ID' });
             
             const result = await query('DELETE FROM requests WHERE id = $1 RETURNING id', [id as string]);
             if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Request not found' });
            }
            return res.status(200).json({ message: 'Request deleted' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
