const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    try {
        console.log('Checking for duplicate Names...');
        const nameRes = await client.query(`
            SELECT name, COUNT(*), array_agg(id ORDER BY id) as ids
            FROM users
            GROUP BY name
            HAVING COUNT(*) > 1
        `);
        
        if (nameRes.rows.length === 0) {
            console.log('No duplicate names found.');
        } else {
            console.log(`Found ${nameRes.rows.length} names with duplicates:`);
            nameRes.rows.forEach(r => {
                console.log(`- "${r.name}": ${r.count} occurrences (IDs: ${r.ids})`);
            });
        }

        console.log('\nChecking for duplicate Emails...');
        const emailRes = await client.query(`
            SELECT email, COUNT(*), array_agg(id ORDER BY id) as ids
            FROM users
            GROUP BY email
            HAVING COUNT(*) > 1
        `);

        if (emailRes.rows.length === 0) {
            console.log('No duplicate emails found.');
        } else {
            console.log(`Found ${emailRes.rows.length} emails with duplicates:`);
            emailRes.rows.forEach(r => {
                console.log(`- "${r.email}": ${r.count} occurrences (IDs: ${r.ids})`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
