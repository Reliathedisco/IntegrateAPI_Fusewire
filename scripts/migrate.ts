import { promises as fsp } from "fs";
import * as path from "path";
import { loadEnvFiles } from "./load-env";

loadEnvFiles();

type PgClient = {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>>; rowCount: number | null }>;
};

/** If the DB was migrated before `schema_migrations` existed, record files that already match reality. */
async function bootstrapLegacyMigrationRows(client: PgClient) {
  const c = await client.query(
    "SELECT COUNT(*)::int AS n FROM schema_migrations",
  );
  const n = Number(c.rows[0]?.n ?? 0);
  if (n > 0) {
    return;
  }

  const markers: Array<{ file: string; table: string }> = [
    {
      file: "001_create_cli_auth_tokens_table.sql",
      table: "cli_auth_tokens",
    },
    {
      file: "002_create_verification_codes_table.sql",
      table: "verification_codes",
    },
  ];

  const recorded: string[] = [];
  for (const { file, table } of markers) {
    const { rows } = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS ok`,
      [table],
    );
    if (rows[0]?.ok) {
      await client.query(
        `INSERT INTO schema_migrations (filename) VALUES ($1)
         ON CONFLICT (filename) DO NOTHING`,
        [file],
      );
      recorded.push(file);
    }
  }

  if (recorded.length) {
    console.log(
      `Bootstrap: marked already-applied migration(s): ${recorded.join(", ")}`,
    );
  }
}

function isConnRefused(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as { code?: string; errors?: Array<{ code?: string }> };
  if (anyErr.code === "ECONNREFUSED") return true;
  return Boolean(anyErr.errors?.some((e) => e.code === "ECONNREFUSED"));
}

async function runMigrations() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is not set. Add it to .env.local (Neon, Supabase, or local Postgres), then run this script again.",
    );
    console.error(
      "Example (hosted): postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require",
    );
    process.exit(1);
  }

  const { default: client } = await import("../lib/db");

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await bootstrapLegacyMigrationRows(client);

    const migrationsDir = path.join(__dirname, "../migrations");
    const files = await fsp.readdir(migrationsDir);
    const migrationFiles = files.filter((file) => file.endsWith(".sql")).sort();

    for (const file of migrationFiles) {
      const done = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [file],
      );
      if (done.rowCount) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = await fsp.readFile(filePath, "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log(`Applied ${file}`);
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        throw e;
      }
    }
    console.log("All migrations completed.");
  } catch (error) {
    console.error("Migration failed:", error);
    if (isConnRefused(error)) {
      console.error(`
Could not reach Postgres (connection refused). Common causes:
  • DATABASE_URL points to localhost but Postgres is not running — start it, or use a cloud URL.
  • You meant to use Neon/Supabase — copy the pooled connection string into .env.local as DATABASE_URL.
  • Ensure DATABASE_URL is in .env.local (this script loads it automatically).`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
