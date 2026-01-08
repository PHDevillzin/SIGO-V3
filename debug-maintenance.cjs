require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkMaintenance() {
    const client = await pool.connect();
    try {
        console.log("Fetching requests with category 'Manutenção'...");
        const res = await client.query("SELECT * FROM requests WHERE categoria_investimento = 'Manutenção'");
        console.log(`Found ${res.rowCount} items.`);
        if (res.rowCount > 0) {
            res.rows.forEach(r => {
                console.log("------------------------------------------");
                console.log("ID:", r.id);
                console.log("Desc:", r.description);
                console.log("Unit:", r.unit);
                console.log("Status:", r.status);
                console.log("Tipologia:", r.tipologia);
            });
        } else {
            // Check if there are any close matches due to encoding/spacing
            const allCats = await client.query("SELECT DISTINCT categoria_investimento FROM requests");
            console.log("All Categories:", allCats.rows.map(r => r.categoria_investimento));
        }
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

checkMaintenance();
