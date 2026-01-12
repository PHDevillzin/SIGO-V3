const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  try {
    console.log("--- MAX NIF (SS%) ---");
    // Get all SS nifs to parse manually if needed, but limit to 100 just to see pattern
    const resSS = await client.query(
      "SELECT nif FROM users WHERE nif LIKE 'SS%' ORDER BY nif DESC LIMIT 10"
    );
    console.log(
      "Top 10 SS:",
      resSS.rows.map((r) => r.nif)
    );

    console.log("--- MAX NIF (SN%) ---");
    const resSN = await client.query(
      "SELECT nif FROM users WHERE nif LIKE 'SN%' ORDER BY nif DESC LIMIT 10"
    );
    console.log(
      "Top 10 SN:",
      resSN.rows.map((r) => r.nif)
    );

    console.log("--- Sample User ---");
    const resUser = await client.query("SELECT * FROM users LIMIT 1");
    console.log(JSON.stringify(resUser.rows[0], null, 2));

    console.log("--- Profiles ---");
    const resProfiles = await client.query("SELECT id FROM profiles LIMIT 5");
    console.log(resProfiles.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
