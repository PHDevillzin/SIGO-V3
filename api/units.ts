```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
import { Unit } from '../types';

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

    // Helper to map DB snake_case to Frontend camelCase
    function mapToFrontend(row: any): Unit {
        return {
            id: row.id,
            codigoUnidade: row.codigo_unidade,
            entidade: row.entidade,
            tipo: row.tipo,
            centro: row.centro,
            cat: row.cat,
            unidade: row.unidade,
            cidade: row.cidade,
            bairro: row.bairro || '',
            endereco: row.endereco || '',
            cep: row.cep || '',
            re: row.re,
            responsavelRE: row.responsavel_re,
            ra: row.ra,
            responsavelRA: row.responsavel_ra,
            responsavelRAR: row.responsavel_rar,
            tipoDeUnidade: row.tipo_de_unidade,
            unidadeResumida: row.unidade_resumida,
            gerenteRegional: row.gerente_regional,
            emailGR: row.email_gr,
            site: row.site || '',
            latitude: row.latitude || '',
            longitude: row.longitude || '',
            status: row.status
        };
    }

    try {
        if (req.method === 'GET') {
            const result = await query('SELECT * FROM units ORDER BY id ASC');
            return res.status(200).json(result.rows.map(mapToFrontend));
        }

        if (req.method === 'POST') {
            const body = req.body as Unit;
            const result = await query(
                `INSERT INTO units(
    codigo_unidade, entidade, tipo, centro, cat, unidade,
    cidade, bairro, endereco, cep, re, responsavel_re, ra, responsavel_ra, responsavel_rar, tipo_de_unidade,
    email_gr, gerente_regional, unidade_resumida, site, latitude, longitude, status
) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
RETURNING * `,
                [
                    body.codigoUnidade, body.entidade, body.tipo, body.centro, body.cat, body.unidade,
                    body.cidade, body.bairro, body.endereco, body.cep, body.re, body.responsavelRE, body.ra, body.responsavelRA, body.responsavelRAR, body.tipoDeUnidade,
                    body.emailGR, body.gerenteRegional, body.unidadeResumida, body.site, body.latitude, body.longitude, body.status ?? true
                ]
            );
            return res.status(201).json(mapToFrontend(result.rows[0]));
        }

        if (req.method === 'PUT') {
            const { id } = req.body;
            const body = req.body as Unit;

            if (!id) return res.status(400).json({ error: 'ID missing' });

            const result = await query(
                `UPDATE units SET
codigo_unidade = COALESCE($1, codigo_unidade),
    entidade = COALESCE($2, entidade),
    tipo = COALESCE($3, tipo),
    centro = COALESCE($4, centro),
    cat = COALESCE($5, cat),
    unidade = COALESCE($6, unidade),
    cidade = COALESCE($7, cidade),
    bairro = COALESCE($8, bairro),
    endereco = COALESCE($9, endereco),
    cep = COALESCE($10, cep),
    re = COALESCE($11, re),
    responsavel_re = COALESCE($12, responsavel_re),
    ra = COALESCE($13, ra),
    responsavel_ra = COALESCE($14, responsavel_ra),
    responsavel_rar = COALESCE($15, responsavel_rar),
    tipo_de_unidade = COALESCE($16, tipo_de_unidade),
    email_gr = COALESCE($17, email_gr),
    gerente_regional = COALESCE($18, gerente_regional),
    unidade_resumida = COALESCE($19, unidade_resumida),
    site = COALESCE($20, site),
    latitude = COALESCE($21, latitude),
    longitude = COALESCE($22, longitude),
    status = COALESCE($23, status)
                WHERE id = $24
RETURNING * `,
                [
                    body.codigoUnidade, body.entidade, body.tipo, body.centro, body.cat, body.unidade,
                    body.cidade, body.bairro, body.endereco, body.cep, body.re, body.responsavelRE, body.ra, body.responsavelRA, body.responsavelRAR, body.tipoDeUnidade,
                    body.emailGR, body.gerenteRegional, body.unidadeResumida, body.site, body.latitude, body.longitude, body.status,
                    id
                ]
            );

            if (result.rows.length === 0) return res.status(404).json({ error: 'Unit not found' });
            return res.status(200).json(mapToFrontend(result.rows[0]));
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing ID' });
    
            await query('DELETE FROM units WHERE id = $1', [id as string]);
            return res.status(200).json({ message: 'Unit deleted' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}


