/**
 * Apply drizzle/0000_init.sql against DATABASE_URL.
 * Usage: npm run db:migrate
 */
import { readFileSync, existsSync } from "node:fs";
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
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required. Copy .env.example to .env.local.");
  }

  const sqlPath = resolve(process.cwd(), "drizzle/0000_init.sql");
  const sql = readFileSync(sqlPath, "utf8");
  const client = postgres(url, { max: 1 });

  try {
    await client.unsafe(sql);
    console.log("Applied drizzle/0000_init.sql");
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
