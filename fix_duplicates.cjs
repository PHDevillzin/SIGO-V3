const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        // Fetch all users ordered by ID to preserve the first occurrence
        const res = await client.query("SELECT * FROM users ORDER BY id ASC");
        const users = res.rows;

        const seenNames = new Map(); // Name -> Count
        const seenEmails = new Map(); // Email -> Count

        console.log(`Processing ${users.length} users...`);

        for (const user of users) {
            let needsUpdate = false;
            let newName = user.name;
            let newEmail = user.email;

            // Normalize for check
            const normName = user.name.trim(); // Case sensitive? User said "similar", usually implies exact match or loose. I'll stick to exact string match for "Duplicate" unless it's obviously same person. But randomness generated exact matches.
            const normEmail = user.email.trim().toLowerCase();

            // Check Name
            if (seenNames.has(normName)) {
                needsUpdate = true;
                const count = seenNames.get(normName) + 1;
                seenNames.set(normName, count);
                newName = `${normName} ${count}`; // e.g. "Ana Silva 2"
                console.log(`[Duplicate Name] ID ${user.id}: "${user.name}" -> "${newName}"`);
            } else {
                seenNames.set(normName, 1);
            }

            // Check Email
            if (seenEmails.has(normEmail)) {
                needsUpdate = true;
                const count = seenEmails.get(normEmail) + 1;
                seenEmails.set(normEmail, count);
                
                // Inject number before @
                const parts = normEmail.split('@');
                newEmail = `${parts[0]}${count}@${parts[1]}`;
                console.log(`[Duplicate Email] ID ${user.id}: "${user.email}" -> "${newEmail}"`);
            } else {
                seenEmails.set(normEmail, 1);
            }

            if (needsUpdate) {
                await client.query(
                    "UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3",
                    [newName, newEmail, user.id]
                );
            }
        }

        console.log('Duplication fix complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
