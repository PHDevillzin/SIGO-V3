
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { requestId, status, user, department } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ error: 'Request ID and Status are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Update Request Status
    await client.query(
      'UPDATE requests SET status = $1 WHERE id = $2',
      [status, requestId]
    );

    await client.query(
      `INSERT INTO movements (request_id, status, user_name, user_department, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [requestId, status, user || 'Sistema', department || 'N/A']
    );

    await client.query('COMMIT');
    
    return res.status(200).json({ message: 'Status updated successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating status:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
