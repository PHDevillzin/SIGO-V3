import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Create a new pool for this request only (inefficient but safe for debugging)
    // using the standard import pattern.
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'DATABASE_URL environment variable is missing' 
            });
        }

        const start = Date.now();
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as now');
        client.release(); // Important: release the client
        const duration = Date.now() - start;

        await pool.end(); // Close pool to prevent dangling connections in this test

        res.status(200).json({ 
            status: 'ok', 
            message: 'Database connection successful (Inlined)',
            timestamp: result.rows[0].now,
            latency: `${duration}ms`,
        });
    } catch (error: any) {
        console.error('DB Health Check Failed:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Database connection failed',
            error: error.message,
            stack: error.stack
        });
    }
}
