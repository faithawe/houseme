import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and start Postgres with `docker compose up -d`.",
    );
  }

  const client = postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
}

let cached: Database | undefined;

/** Lazy client — the app boots without DATABASE_URL until a query runs. */
export function getDb(): Database {
  if (!cached) {
    cached = createDb();
  }
  return cached;
}
