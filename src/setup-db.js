require("dotenv").config();
const { Client } = require("pg");

const dbName = process.env.DB_NAME || "todoapp";

async function main() {
  const admin = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });

  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${dbName}`);
    console.log(`Created database "${dbName}".`);
  } else {
    console.log(`Database "${dbName}" already exists.`);
  }
  await admin.end();
}

main().catch((err) => {
  console.error("Could not create database.");
  console.error(err.message);
  console.error("\nOpen .env and set DB_PASSWORD to your PostgreSQL (postgres user) password.");
  process.exit(1);
});
