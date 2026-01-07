import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Inline DB Connection (Standard Pattern for this project)
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
        // LOGIN
        if (req.method === 'POST') {
            const { nif, password } = req.body;

            if (!nif || !password) {
                return res.status(400).json({ error: 'NIF and Password are required' });
            }

            // 1. Check User Credentials
            // In a real app, compare HASH. For prototype, comparing plain text as per migration.
            const userRes = await query('SELECT * FROM users WHERE nif = $1 AND password = $2', [nif, password]);
            
            if (userRes.rows.length === 0) {
                 return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = userRes.rows[0];

            // 2. Check Permissions in users table (sigo_profiles array)
            // Requirement matches stored profile_ids in the users table
            
            // Note: users table stores sigo_profiles as text[]. In PG, this comes back as string[]
            const userProfiles = user.sigo_profiles || [];
            
            // Check for Admin access
            // ID for admin is 'admin_sys'. We also allow name fallback 'Administração do sistema' just in case.
            // ALSO CHECK LEGACY 'profile' column for the migration admin user
            const hasAdminAccess = 
                userProfiles.includes('admin_sys') || 
                userProfiles.includes('Administração do sistema') ||
                user.profile === 'Administração do sistema';
            
            if (!hasAdminAccess) {
                 return res.status(403).json({ error: 'Access denied: User does not have Administrator profile.' });
            }

            // 3. Success
            // Return user info and the profile found
            return res.status(200).json({
                user: {
                    id: user.id,
                    nif: user.nif,
                    name: user.name,
                    email: user.email
                },
                profile: { id: 'admin_sys', name: 'Administração do sistema' } // Return static profile for now since we validated access
            });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Auth API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
