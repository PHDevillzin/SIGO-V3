
import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

// Helper to sanitize dates for DB
function sanitizeDate(date: string | null | undefined): string | null {
    if (!date) return null;
    // Basic check if date is valid
    const timestamp = Date.parse(date);
    if (isNaN(timestamp)) return null;
    return new Date(timestamp).toISOString();
}

// Map Request (Frontend camelCase) to DB (snake_case)
function mapToDb(body: any) {
    return {
        criticality: body.criticality,
        unit: body.unit,
        description: body.description || body.titulo, // Fallback for titulo
        status: body.status,
        current_location: body.currentLocation,
        gestor_local: body.gestorLocal,
        expected_start_date: sanitizeDate(body.expectedStartDate || body.inicioExecucao), // Fallback
        has_info: body.hasInfo,
        expected_value: body.expectedValue || body.valorExecucao, // Fallback
        executing_unit: body.executingUnit,
        prazo: body.prazo || body.prazoExecucao, // Fallback
        categoria_investimento: body.categoriaInvestimento,
        entidade: body.entidade,
        ordem: body.ordem,
        situacao_projeto: body.situacaoProjeto,
        situacao_obra: body.situacaoObra,
        inicio_obra: sanitizeDate(body.inicioObra),
        saldo_obra_prazo: body.saldoObraPrazo,
        saldo_obra_valor: body.saldoObraValor,
        tipologia: body.tipologia,
        // New Fields
        solicitante: body.solicitante,
        gerencia: body.gerencia,
        objetivo: body.objetivo,
        expectativa_resultados: body.expectativaResultados,
        justificativa: body.justificativa,
        resumo_servicos: body.resumoServicos,
        aumento: body.aumento, // Array
        necessidades: body.necessidades, // Array
        servicos_necessarios: body.servicosNecessarios, // Array
        servicos_especificos: body.servicosEspecificos, // Array
        area_intervencao: body.areaIntervencao,
        data_utilizacao: sanitizeDate(body.dataUtilizacao),
        possui_projeto: body.possuiProjeto,
        possui_laudo: body.possuiLaudo,
        tem_autorizacao: body.temAutorizacao,
        realizou_consulta: body.realizouConsulta,
        houve_notificacao: body.houveNotificacao,
        referencia: body.referencia,
        area_responsavel: body.areaResponsavel,
        areas_envolvidas: body.areasEnvolvidas,
        programa_necessidades: body.programaNecessidades,
        instalacoes_sesi_senai: body.instalacoesSesiSenai,
        local_obra: body.localObra,
        atividade: body.atividade,
        local_nome: body.local || body.localNome,
        problemas_nao_atendida: body.problemasNaoAtendida,
        prazo_acao: body.prazoAcao,
        probabilidade_evolucao: body.probabilidadeEvolucao
    };
}

// Map DB row (snake_case) to Frontend (camelCase)
function mapFromDb(row: any) {
    if (!row) return null;
    return {
        id: row.id,
        criticality: row.criticality,
        unit: row.unit,
        description: row.description,
        status: row.status,
        currentLocation: row.current_location,
        gestorLocal: row.gestor_local,
        expectedStartDate: row.expected_start_date,
        hasInfo: row.has_info,
        expectedValue: row.expected_value,
        executingUnit: row.executing_unit,
        prazo: row.prazo,
        categoriaInvestimento: row.categoria_investimento,
        entidade: row.entidade,
        ordem: row.ordem,
        situacaoProjeto: row.situacao_projeto,
        situacaoObra: row.situacao_obra,
        inicioObra: row.inicio_obra,
        saldoObraPrazo: row.saldo_obra_prazo,
        saldoObraValor: row.saldo_obra_valor,
        tipologia: row.tipologia,
        // New Fields
        solicitante: row.solicitante,
        gerencia: row.gerencia,
        titulo: row.description, // Map back description to titulo for editing if needed
        objetivo: row.objetivo,
        expectativaResultados: row.expectativa_resultados,
        justificativa: row.justificativa,
        resumoServicos: row.resumo_servicos,
        aumento: row.aumento,
        necessidades: row.necessidades,
        servicosNecessarios: row.servicos_necessarios,
        servicosEspecificos: row.servicos_especificos,
        areaIntervencao: row.area_intervencao,
        dataUtilizacao: row.data_utilizacao,
        possuiProjeto: row.possui_projeto,
        possuiLaudo: row.possui_laudo,
        temAutorizacao: row.tem_autorizacao,
        realizouConsulta: row.realizou_consulta,
        houveNotificacao: row.houve_notificacao,
        referencia: row.referencia,
        areaResponsavel: row.area_responsavel,
        areasEnvolvidas: row.areas_envolvidas,
        programaNecessidades: row.programa_necessidades,
        instalacoesSesiSenai: row.instalacoes_sesi_senai,
        localObra: row.local_obra,
        atividade: row.atividade,
        local: row.local_nome,
        problemasNaoAtendida: row.problemas_nao_atendida,
        prazoAcao: row.prazo_acao,
        probabilidadeEvolucao: row.probabilidade_evolucao
    };
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
                return res.status(200).json(mapFromDb(result.rows[0]));
            } else {
                const result = await query('SELECT * FROM requests ORDER BY id DESC');
                return res.status(200).json(result.rows.map(mapFromDb));
            }
        }

        if (req.method === 'POST') {
            const data = mapToDb(req.body);
            
            // Build dynamic Insert
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const columns = fields.join(', ');

            const result = await query(
                `INSERT INTO requests (${columns}) VALUES (${placeholders}) RETURNING *`,
                values
            );
            
            // Should also create initial movement?
            // "Solicitação criada"
            const newReq = result.rows[0];
            await query(
                `INSERT INTO movements (request_id, status, user_name, user_department, created_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [newReq.id, 'Solicitação criada', 'Sistema', 'Sistema']
            );

            return res.status(201).json(mapFromDb(newReq));
        }

        if (req.method === 'PUT') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'Missing ID' });
            
            const data = mapToDb(req.body);
            delete (data as any).id; // Make sure we don't update ID

            const fields = Object.keys(data);
            const values = Object.values(data);
            // set col = val
            const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
            
            values.push(id); // Add ID as last param for WHERE

            const result = await query(
                `UPDATE requests SET ${setClause} WHERE id = $${values.length} RETURNING *`,
                values
            );
            
            if (result.rows.length === 0) {
                 return res.status(404).json({ error: 'Request not found' });
            }

            const updatedReq = result.rows[0];
            
            // Check if status changed or just provided? 
            // If body had status, we assume it's a significant move or we just track it.
            // Simplified: If 'status' was in the update payload, record it.
            if ('status' in data && data.status) {
                // Try to get user info from body or default
                 const userName = req.body.userName || 'Sistema';
                 const userDept = req.body.userDepartment || 'Automático';
                 
                 await query(
                    `INSERT INTO movements (request_id, status, user_name, user_department, created_at)
                     VALUES ($1, $2, $3, $4, NOW())`,
                    [updatedReq.id, updatedReq.status, userName, userDept]
                );
            }

            return res.status(200).json(mapFromDb(updatedReq));
        }
        
        if (req.method === 'DELETE') {
             const { id } = req.query;
             if (!id) return res.status(400).json({ error: 'Missing ID' });
             
             // Check foreign keys? movements.
             // Delete movements first
             await query('DELETE FROM movements WHERE request_id = $1', [id as string]);
             
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
