import { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

// Simple interface for User to help with type checking inside the handler
interface UserData {
    nif: string;
    name: string;
    email: string;
    unidade?: string;
    profile?: string;
    sigo_profiles?: string[];
    linked_units?: string[];
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
            const { nif } = req.query;

            // Query to fetch user data with aggregated permissions from user_access
            // We use COALESCE to fallback to empty arrays if no access found
            // We prefer data from user_access, but if completely missing, we might see legacy array columns (optional, ignoring for now as per instruction)
            const listQuery = `
                SELECT 
                    u.*, 
                    array_remove(array_agg(DISTINCT ua.profile_id), NULL) as sigo_profiles,
                    array_remove(array_agg(DISTINCT un.unidade), NULL) as linked_units,
                    MAX(ua.instituicao) as instituicao
                FROM users u
                LEFT JOIN user_access ua ON u.nif = ua.user_nif
                LEFT JOIN units un ON ua.unit_id = un.id
                GROUP BY u.id, u.nif, u.name, u.email, u.created_by, u.created_at, u.updated_at, u.last_edited_by, u.registration_date, u.password
                ORDER BY u.name ASC
            `;

            const singleUserQuery = `
                SELECT 
                    u.*, 
                    array_remove(array_agg(DISTINCT ua.profile_id), NULL) as sigo_profiles,
                    array_remove(array_agg(DISTINCT un.unidade), NULL) as linked_units,
                    MAX(ua.instituicao) as instituicao
                FROM users u
                LEFT JOIN user_access ua ON u.nif = ua.user_nif
                LEFT JOIN units un ON ua.unit_id = un.id
                WHERE u.nif = $1
                GROUP BY u.id, u.nif, u.name, u.email, u.created_by, u.created_at, u.updated_at, u.last_edited_by, u.registration_date, u.password
            `;

            if (nif) {
                const result = await query(singleUserQuery, [nif as string]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                return res.status(200).json(result.rows[0]);
            } else {
                const result = await query(listQuery);
                return res.status(200).json(result.rows);
            }
        }

        if (req.method === 'POST' || req.method === 'PUT') {
            const isPut = req.method === 'PUT';
            const { nif, name, email, unidade, profile, sigo_profiles, linked_units, id } = req.body as any;

            if (!nif || !name) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // 1. Upsert User in `users` table
            // We focus on basic identity here. Access is handled separately.
            let userResult;
            if (isPut) {
                // Update existing
                userResult = await query(
                    `UPDATE users 
                     SET name = COALESCE($2, name), 
                         email = COALESCE($3, email), 
                         updated_at = NOW()
                     WHERE nif = $1
                     RETURNING id, nif, name, email`,
                    [nif, name, email] // Basic fields only
                );
            } else {
                // Insert new (chk if exists first just in case to be safe, or rely on constraint)
                // If conflict on NIF, we update (Upsert)
                userResult = await query(
                    `INSERT INTO users (nif, name, email, created_at, updated_at)
                     VALUES ($1, $2, $3, NOW(), NOW())
                     ON CONFLICT (nif) DO UPDATE 
                     SET name = EXCLUDED.name, email = EXCLUDED.email, updated_at = NOW()
                     RETURNING id, nif, name, email`,
                    [nif, name, email]
                );
            }

            if (userResult.rows.length === 0) {
                return res.status(500).json({ error: 'Failed to save user identity' });
            }

            // 2. Manage `user_access`
            // Strategy: Wipe existing permissions for this user and re-insert.
            await query('DELETE FROM user_access WHERE user_nif = $1', [nif]);

            // 3. Insert new permissions
            // We expect sigo_profiles (array of IDs) and linked_units (array of names)
            // We need to resolve Unit Names to Unit IDs.
            if (sigo_profiles && sigo_profiles.length > 0) {

                // Fetch Units map if needed
                let unitMap: Record<string, number> = {};
                if (linked_units && linked_units.length > 0) {
                    const unitsRes = await query('SELECT id, unidade FROM units WHERE unidade = ANY($1)', [linked_units]);
                    unitsRes.rows.forEach((row: any) => {
                        unitMap[row.unidade] = row.id;
                    });
                }

                const insertValues: any[] = [];
                let placeholders: string[] = [];
                let paramCounter = 1;

                // Cartesian Product: Each Profile x Each Unit
                // If NO units provided (e.g. Admin), we verify if logic allows.
                // Assuming Admin doesn't need Unit ID (NULL).
                const targetUnits = (linked_units && linked_units.length > 0) ? linked_units : [null];

                // Determine Instituicao based on NIF
                let instituicao = null;
                if (nif.toUpperCase().startsWith('SS')) instituicao = 'SESI';
                else if (nif.toUpperCase().startsWith('SN')) instituicao = 'SENAI';

                for (const pid of sigo_profiles) {
                    for (const uname of targetUnits) {
                        const uid = uname ? unitMap[uname] : null;

                        // Validation: If unit provided but not found, skip or error? 
                        // We skip if unit name existed in request but not in DB.
                        if (uname && !uid) continue;

                        placeholders.push(`($${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++})`);
                        insertValues.push(nif, uid, pid, instituicao);
                    }
                }

                if (placeholders.length > 0) {
                    const insertQuery = `
                        INSERT INTO user_access (user_nif, unit_id, profile_id, instituicao)
                        VALUES ${placeholders.join(', ')}
                    `;
                    await query(insertQuery, insertValues);
                }
            }

            return res.status(200).json({
                ...userResult.rows[0],
                sigo_profiles: sigo_profiles || [],
                linked_units: linked_units || []
            });
        }

        if (req.method === 'DELETE') {
            const { id, nif } = req.query;
            const targetNif = nif as string; // Ideally resolve ID to NIF if only ID provided, but NIF is primary key for logic

            if (!targetNif) return res.status(400).json({ error: 'NIF required for deletion' });

            await query('DELETE FROM user_access WHERE user_nif = $1', [targetNif]); // Clean permissions first
            await query('DELETE FROM users WHERE nif = $1', [targetNif]);

            return res.status(200).json({ message: 'User and permissions deleted' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
