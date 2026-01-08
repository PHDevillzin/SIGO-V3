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

    // Inline DB Connection
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
            const client = await pool.connect();
            try {
                const result = await client.query('SELECT * FROM units ORDER BY id ASC');
                return res.status(200).json(result.rows);
            } finally {
                client.release();
            }
        }

        if (req.method === 'POST') {
            const {
                codigoUnidade, entidade, tipo, centro, cat, unidade,
                cidade, bairro, endereco, cep, re, responsavelRE, ra, responsavelRA, responsavelRAR, tipoDeUnidade,
                emailGR, gerenteRegional, unidadeResumida, site, latitude, longitude, status
            } = req.body as Unit; // Cast req.body to Unit type

            // Using snake_case for DB columns based on initial load
            const result = await query(
                `INSERT INTO units (
                    codigo_unidade, entidade, tipo, centro, cat, unidade,
                    cidade, bairro, endereco, cep, re, responsavel_re, ra, responsavel_ra, responsavel_rar, tipo_de_unidade,
                    email_gr, gerente_regional, unidade_resumida, site, latitude, longitude, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                RETURNING *`,
                [
                    codigoUnidade, entidade, tipo, centro, cat, unidade,
                    cidade, bairro, endereco, cep, re, responsavelRE, ra, responsavelRA, responsavelRAR, tipoDeUnidade,
                    emailGR, gerenteRegional, unidadeResumida, site, latitude, longitude, status
                ]
            );
            return res.status(201).json(mapToFrontend(result.rows[0]));
        }

        if (req.method === 'PUT') {
            const { id } = req.body;
            const body: Unit = req.body;

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
                    responsavel_re = COALESCE($8, responsavel_re),
                    ra = COALESCE($9, ra),
                    responsavel_ra = COALESCE($10, responsavel_ra),
                    responsavel_rar = COALESCE($11, responsavel_rar),
                    tipo_de_unidade = COALESCE($12, tipo_de_unidade),
                    email_gr = COALESCE($13, email_gr),
                    gerente_regional = COALESCE($14, gerente_regional),
                    unidade_resumida = COALESCE($15, unidade_resumida)
                WHERE id = $16
                RETURNING *`,
                [
                    codigoUnidade, entidade, tipo, centro, cat, unidade,
                    cidade, responsavelRE, ra, responsavelRA, responsavelRAR, tipoDeUnidade,
                    emailGR, gerenteRegional, unidadeResumida, id
                ]
            );

            if (result.rows.length === 0) return res.status(404).json({ error: 'Unit not found' });
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


