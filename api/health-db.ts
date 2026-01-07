import { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'DATABASE_URL environment variable is missing' 
            });
        }

        const start = Date.now();
        const result = await query('SELECT NOW() as now');
        const duration = Date.now() - start;

        res.status(200).json({ 
            status: 'ok', 
            message: 'Database connection successful',
            timestamp: result.rows[0].now,
            latency: `${duration}ms`,
            env_var_length: process.env.DATABASE_URL.length // Safe way to verify value exists
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
