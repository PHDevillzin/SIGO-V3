
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        const unitRes = await client.query(`SELECT unidade FROM units WHERE unidade LIKE '%Vila Alpina%'`);
        const reqRes = await client.query(`SELECT unit FROM requests WHERE unit LIKE '%Vila Alpina%' LIMIT 1`);

        const unitStr = unitRes.rows[0].unidade;
        const reqStr = reqRes.rows[0].unit;

        console.log(`Unit Table ('${unitStr}'): length=${unitStr.length}`);
        console.log(`Req Table  ('${reqStr}'): length=${reqStr.length}`);

        console.log("Unit Chars:", Buffer.from(unitStr));
        console.log("Req Chars: ", Buffer.from(reqStr));

        console.log(`Match? ${unitStr === reqStr}`);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
