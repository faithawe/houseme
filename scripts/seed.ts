import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { hashPassword } from "../lib/auth/password";
import { fileAuthStore } from "../lib/auth/file-store";

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

const SEED_USERS = [
  {
    email: "tenant@houseme.ng",
    password: "Tenant1!House",
    name: "Demo Tenant",
    phone: "+2348000000001",
    role: "tenant" as const,
  },
  {
    email: "landlord@houseme.ng",
    password: "Landlord1!House",
    name: "Demo Landlord",
    phone: "+2348000000002",
    role: "landlord" as const,
  },
  {
    email: "admin@houseme.ng",
    password: process.env.ADMIN_PASSWORD ?? "Admin1!House",
    name: "HouseMe Admin",
    phone: "+2348000000003",
    role: "admin" as const,
  },
];

async function seedFileStore() {
  await fileAuthStore.ensureSeedUsers();
  console.log("Seeded file auth store (.data/users.json)");
  console.log("\nLog in with:");
  console.log("  tenant@houseme.ng / Tenant1!House");
  console.log("  landlord@houseme.ng / Landlord1!House");
  console.log("  admin@houseme.ng / Admin1!House");
}

async function seedPostgres() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required when AUTH_STORE is not file.");
  }

  const client = postgres(url, { max: 1 });

  try {
    for (const entry of SEED_USERS) {
      const [existing] = await client<
        { id: string }[]
      >`SELECT id FROM users WHERE email = ${entry.email.toLowerCase()} LIMIT 1`;

      if (existing) {
        console.log(`Skip ${entry.email} (already exists)`);
        continue;
      }

      const passwordHash = await hashPassword(entry.password);

      const [inserted] = await client<{ id: string }[]>`
        INSERT INTO users (email, password_hash, name, phone, role, email_verified)
        VALUES (
          ${entry.email.toLowerCase()},
          ${passwordHash},
          ${entry.name},
          ${entry.phone},
          ${entry.role},
          true
        )
        RETURNING id
      `;

      if (entry.role === "landlord") {
        await client`
          INSERT INTO landlord_profiles (user_id)
          VALUES (${inserted.id})
        `;
      }

      console.log(`Created ${entry.role}: ${entry.email}`);
    }

    console.log("\nSeed complete. Log in with:");
    console.log("  tenant@houseme.ng / Tenant1!House");
    console.log("  landlord@houseme.ng / Landlord1!House");
    console.log("  admin@houseme.ng / Admin1!House (or ADMIN_PASSWORD)");
  } finally {
    await client.end();
  }
}

async function seed() {
  if (process.env.AUTH_STORE === "file") {
    await seedFileStore();
    return;
  }
  await seedPostgres();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
