const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const schemaSql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");

let client;

async function initSchema() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: 3000,
  });

  try {
    await pool.query(schemaSql);
    client = pool;
    console.log(`Connected to PostgreSQL database "${process.env.DB_NAME}".`);
  } catch (err) {
    await pool.end().catch(() => {});
    console.warn("PostgreSQL login failed:", err.message);
    console.warn("Starting with built-in PGlite so you can still open the website.");
    console.warn("To use your real PostgreSQL, set DB_PASSWORD in .env and restart.");

    const { PGlite } = require("@electric-sql/pglite");
    const embedded = new PGlite();
    await embedded.exec(schemaSql);
    client = {
      query: async (text, params) => {
        const result = await embedded.query(text, params);
        return {
          rows: result.rows,
          rowCount: Number(result.affectedRows ?? result.rows.length),
        };
      },
    };
  }
}

function query(text, params) {
  return client.query(text, params);
}

module.exports = { query, initSchema };
