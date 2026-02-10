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

            // Transform snake_case DB columns to camelCase for specific fields if needed
            // But usually we just return row. Frontend maps it.
            // We need to ensure new columns is_requester_sede, etc are in the select *

            if (nif) {
                const result = await query(singleUserQuery, [nif as string]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                const user = result.rows[0];
                // Map snake_case to camelCase for the new booleans
                const mappedUser = {
                    ...user,
                    isRequesterSede: user.is_requester_sede,
                    isRequesterStrategic: user.is_requester_strategic,
                    isApproverSede: user.is_approver_sede,
                    isApproverStrategic: user.is_approver_strategic
                };
                return res.status(200).json(mappedUser);
            } else {
                const result = await query(listQuery);
                 const mappedUsers = result.rows.map((user: any) => ({
                    ...user,
                    isRequesterSede: user.is_requester_sede,
                    isRequesterStrategic: user.is_requester_strategic,
                    isApproverSede: user.is_approver_sede,
                    isApproverStrategic: user.is_approver_strategic
                }));
                return res.status(200).json(mappedUsers);
            }
        }

        if (req.method === 'POST' || req.method === 'PUT') {
            const isPut = req.method === 'PUT';
            const { 
                nif, name, email, isActive, 
                isRequesterSede, isRequesterStrategic, isApproverSede, isApproverStrategic,
                sigo_profiles, linked_units 
            } = req.body as any;

            if (!nif || !name) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            let userResult;
            if (isPut) {
                userResult = await query(
                    `UPDATE users 
                     SET name = COALESCE($2, name), 
                         email = COALESCE($3, email), 
                         is_active = COALESCE($4, is_active),
                         is_requester_sede = COALESCE($5, is_requester_sede),
                         is_requester_strategic = COALESCE($6, is_requester_strategic),
                         is_approver_sede = COALESCE($7, is_approver_sede),
                         is_approver_strategic = COALESCE($8, is_approver_strategic),
                         updated_at = NOW()
                     WHERE nif = $1
                     RETURNING id, nif, name, email, is_active, is_requester_sede, is_requester_strategic, is_approver_sede, is_approver_strategic`,
                    [nif, name, email, isActive ?? null, isRequesterSede ?? null, isRequesterStrategic ?? null, isApproverSede ?? null, isApproverStrategic ?? null] 
                );
            } else {
                userResult = await query(
                    `INSERT INTO users (nif, name, email, is_active, is_requester_sede, is_requester_strategic, is_approver_sede, is_approver_strategic, created_at, updated_at)
                     VALUES ($1, $2, $3, COALESCE($4, true), COALESCE($5, false), COALESCE($6, false), COALESCE($7, false), COALESCE($8, false), NOW(), NOW())
                     ON CONFLICT (nif) DO UPDATE 
                     SET name = EXCLUDED.name, 
                         email = EXCLUDED.email, 
                         is_active = EXCLUDED.is_active, 
                         is_requester_sede = EXCLUDED.is_requester_sede,
                         is_requester_strategic = EXCLUDED.is_requester_strategic,
                         is_approver_sede = EXCLUDED.is_approver_sede,
                         is_approver_strategic = EXCLUDED.is_approver_strategic,
                         updated_at = NOW()
                     RETURNING id, nif, name, email, is_active, is_requester_sede, is_requester_strategic, is_approver_sede, is_approver_strategic`,
                    [nif, name, email, isActive ?? null, isRequesterSede ?? false, isRequesterStrategic ?? false, isApproverSede ?? false, isApproverStrategic ?? false]
                );
            }

            if (userResult.rows.length === 0) {
                return res.status(500).json({ error: 'Failed to save user identity' });
            }

            // 2. Manage `user_access`
            if (sigo_profiles !== undefined || linked_units !== undefined) {
                await query('DELETE FROM user_access WHERE user_nif = $1', [nif]);

                if (sigo_profiles && sigo_profiles.length > 0) {
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

                    const targetUnits = (linked_units && linked_units.length > 0) ? linked_units : [null];
                    let instituicao = null;
                    if (nif.toUpperCase().startsWith('SS')) instituicao = 'SESI';
                    else if (nif.toUpperCase().startsWith('SN')) instituicao = 'SENAI';

                    for (const pid of sigo_profiles) {
                        for (const uname of targetUnits) {
                            const uid = uname ? unitMap[uname] : null;
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
            }

             const user = userResult.rows[0];
             const responseData = {
                ...user,
                isRequesterSede: user.is_requester_sede,
                isRequesterStrategic: user.is_requester_strategic,
                isApproverSede: user.is_approver_sede,
                isApproverStrategic: user.is_approver_strategic,
                sigo_profiles: sigo_profiles || [],
                linked_units: linked_units || []
            };

            return res.status(200).json(responseData);
        }

        if (req.method === 'DELETE') {
            const { id, nif } = req.query;
            const targetNif = nif as string; 

            if (!targetNif) return res.status(400).json({ error: 'NIF required for deletion' });
            
            await query('DELETE FROM user_access WHERE user_nif = $1', [targetNif]); 
            return res.status(200).json({ message: 'User access revoked (unlinked)' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await pool.end();
    }
}
