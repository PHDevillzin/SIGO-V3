const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        console.log('Fetching users with " 2" suffix...');
        const res = await client.query("SELECT * FROM users WHERE name LIKE '% 2'");
        const users = res.rows;

        if (users.length === 0) {
            console.log('No users with " 2" suffix found.');
            return;
        }

        console.log(`Found ${users.length} users to update.`);

        const usedEmails = new Set();
        const usedNames = new Set();

        // Pre-load existing names/emails to avoid collision with existing "Fulano" (unlikely but safe)
        const allRes = await client.query("SELECT name, email FROM users WHERE id NOT IN (" + users.map(u => u.id).join(',') + ")");
        allRes.rows.forEach(r => {
            usedNames.add(r.name.toLowerCase());
            usedEmails.add(r.email.toLowerCase());
        });

        for (const user of users) {
            // "Ana Correia 2" -> ["Ana", "Correia", "2"]
            const parts = user.name.split(' ');
            if (parts.length < 2) continue; // Should not happen given search query

            const firstName = parts[0];
            const originalSurname = parts.slice(1, parts.length - 1).join(' '); // "Correia"

            let newName = `${firstName} Fulano`;
            let newEmailUser = `${firstName.toLowerCase()}fulano`;
            let newEmail = `${newEmailUser}@sesisenaisp.org.br`;

            // Collision Detection
            if (usedNames.has(newName.toLowerCase()) || usedEmails.has(newEmail.toLowerCase())) {
                console.log(`Collision detected for ${newName}/${newEmail}. Trying with original surname...`);
                // Fallback: "Wagner Costa Fulano"
                newName = `${firstName} ${originalSurname} Fulano`;
                newEmailUser = `${firstName.toLowerCase()}${originalSurname.toLowerCase().replace(/\s+/g, '')}fulano`;
                newEmail = `${newEmailUser}@sesisenaisp.org.br`;
                
                // If still collision? (Unlikely for this limited set)
                if (usedNames.has(newName.toLowerCase()) || usedEmails.has(newEmail.toLowerCase())) {
                     console.warn(`CRITICAL: Still colliding for ${user.id}. Skipping to avoid invalid state.`);
                     continue;
                }
            }

            console.log(`Updating ID ${user.id}: "${user.name}" -> "${newName}" | "${user.email}" -> "${newEmail}"`);
            
            await client.query(
                "UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3",
                [newName, newEmail, user.id]
            );

            usedNames.add(newName.toLowerCase());
            usedEmails.add(newEmail.toLowerCase());
        }

        console.log('Update complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
