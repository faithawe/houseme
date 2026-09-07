/**
 * Apply drizzle/*.sql against DATABASE_URL in order.
 * Usage: npm run db:migrate
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required. Copy .env.example to .env.local.");
  }

  const drizzleDir = resolve(process.cwd(), "drizzle");
  const files = readdirSync(drizzleDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const client = postgres(url, {
    max: 1,
    ssl: /neon\.tech|supabase\.co|pooler\./i.test(url) ? "require" : undefined,
  });

  try {
    await client`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    // If schema already exists from a prior bare init, mark 0000 applied.
    const [usersTable] = await client<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS exists
    `;
    if (usersTable?.exists) {
      await client`
        INSERT INTO schema_migrations (filename)
        VALUES ('0000_init.sql')
        ON CONFLICT DO NOTHING
      `;
    }

    for (const file of files) {
      const [existing] = await client<{ filename: string }[]>`
        SELECT filename FROM schema_migrations WHERE filename = ${file} LIMIT 1
      `;
      if (existing) {
        console.log(`Skip ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(resolve(drizzleDir, file), "utf8");
      await client.unsafe(sql);
      await client`INSERT INTO schema_migrations (filename) VALUES (${file})`;
      console.log(`Applied ${file}`);
    }
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
