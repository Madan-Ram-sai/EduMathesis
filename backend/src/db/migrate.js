import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "./index.js";

dotenv.config({ path: "./.env" });

const migrationsTableSql = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export async function migrateDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(migrationsTableSql);

    const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");
    const migrationFiles = (await fs.readdir(directory))
      .filter((file) => /^\d+_.+\.sql$/.test(file))
      .sort();

    for (const migrationId of migrationFiles) {
      const applied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE id = $1",
        [migrationId]
      );

      if (applied.rowCount > 0) continue;

      const sql = await fs.readFile(path.join(directory, migrationId), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migrationId]);
      console.log(`Applied migration ${migrationId}`);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateDatabase()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error("Database migration failed:", error);
      await pool.end();
      process.exit(1);
    });
}
