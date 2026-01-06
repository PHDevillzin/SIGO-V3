import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
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

  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM units ORDER BY id ASC');
      // Convert database snake_case to camelCase if needed, or update frontend to use snake_case
      // For now, let's return as is and we might need to adjust frontend mapping
      // Actually, better to map here to match the frontend interface
      const units = result.rows.map(row => ({
        id: row.id,
        codigoUnidade: row.codigo_unidade,
        entidade: row.entidade,
        tipo: row.tipo,
        centro: row.centro,
        cat: row.cat,
        unidade: row.unidade,
        cidade: row.cidade,
        bairro: row.bairro,
        endereco: row.endereco,
        cep: row.cep,
        re: row.re,
        responsavelRE: row.responsavel_re,
        ra: row.ra,
        responsavelRA: row.responsavel_ra,
        responsavelRAR: row.responsavel_rar,
        tipoDeUnidade: row.tipo_de_unidade,
        unidadeResumida: row.unidade_resumida,
        gerenteRegional: row.gerente_regional,
        emailGR: row.email_gr,
        site: row.site,
        latitude: row.latitude,
        longitude: row.longitude
      }));
      res.status(200).json(units);
    } else if (req.method === 'POST') {
      const data = req.body;
      const text = `
        INSERT INTO units (
          codigo_unidade, entidade, tipo, centro, cat, unidade, cidade, bairro, endereco, cep, 
          re, responsavel_re, ra, responsavel_ra, responsavel_rar, tipo_de_unidade, 
          unidade_resumida, gerente_regional, email_gr, site, latitude, longitude
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING *
      `;
      const values = [
        data.codigoUnidade, data.entidade, data.tipo, data.centro, data.cat, data.unidade, data.cidade, data.bairro, data.endereco, data.cep,
        data.re, data.responsavelRE, data.ra, data.responsavelRA, data.responsavelRAR, data.tipoDeUnidade,
        data.unidadeResumida, data.gerenteRegional, data.emailGR, data.site, data.latitude, data.longitude
      ];
      
      const result = await query(text, values);
      res.status(201).json(result.rows[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
