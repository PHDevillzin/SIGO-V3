
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const { requestId } = req.query;

      if (!requestId) {
        return res.status(400).json({ error: 'Request ID is required' });
      }

      const result = await client.query(
        'SELECT * FROM movements WHERE request_id = $1 ORDER BY created_at DESC',
        [requestId]
      );

      return res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      const { requestId, status, userName, userDepartment, notes } = req.body;

      if (!requestId || !status) {
        return res.status(400).json({ error: 'Request ID and Status are required' });
      }

      const result = await client.query(
        `INSERT INTO movements (request_id, status, user_name, user_department, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [requestId, status, userName, userDepartment, notes]
      );

      return res.status(201).json(result.rows[0]);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in movements API:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
