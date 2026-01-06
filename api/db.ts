import { Pool } from "pg";

// Access the environment variable.
// Note: In Vercel, this is process.env.DATABASE_URL.
// In Vite (client-side), it would be import.meta.env, but this file is meant for the server-side function (Node.js).
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL environment variable is not set.");
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
