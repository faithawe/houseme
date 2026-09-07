import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { hashPassword } from "../lib/auth/password";
import { fileAuthStore } from "../lib/auth/file-store";
import { DEMO_LISTINGS } from "../lib/demo-listings";

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

  const client = postgres(url, {
    max: 1,
    ssl: /neon\.tech|supabase\.co|pooler\./i.test(url) ? "require" : undefined,
  });

  try {
    const userIds: Record<string, string> = {};

    for (const entry of SEED_USERS) {
      const [existing] = await client<
        { id: string }[]
      >`SELECT id FROM users WHERE email = ${entry.email.toLowerCase()} LIMIT 1`;

      if (existing) {
        console.log(`Skip ${entry.email} (already exists)`);
        userIds[entry.role] = existing.id;
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

      userIds[entry.role] = inserted.id;

      if (entry.role === "landlord") {
        await client`
          INSERT INTO landlord_profiles (user_id)
          VALUES (${inserted.id})
          ON CONFLICT (user_id) DO NOTHING
        `;
      }

      console.log(`Created ${entry.role}: ${entry.email}`);
    }

    const landlordId = userIds.landlord;
    if (landlordId) {
      const [{ count }] = await client<{ count: string }[]>`
        SELECT count(*)::text AS count FROM listings WHERE landlord_id = ${landlordId}
      `;

      if (Number(count) === 0) {
        for (const [index, listing] of DEMO_LISTINGS.entries()) {
          const status = index === 1 ? "pending_review" : index === 2 ? "rejected" : "live";
          const [row] = await client<{ id: string }[]>`
            INSERT INTO listings (
              landlord_id, title, description, property_type, price, price_period,
              city, area, address, bedrooms, bathrooms, furnished, amenities,
              status, rejection_reason, view_count, contact_clicks, published_at
            ) VALUES (
              ${landlordId},
              ${listing.title},
              ${listing.description},
              ${listing.propertyType},
              ${listing.price},
              ${listing.pricePeriod},
              ${listing.city},
              ${listing.area},
              ${listing.address},
              ${listing.bedrooms},
              ${listing.bathrooms},
              ${listing.furnished},
              ${listing.amenities},
              ${status},
              ${status === "rejected" ? "Add clearer photos of the kitchen and bathroom." : null},
              ${listing.viewCount},
              ${listing.contactClicks},
              ${status === "live" ? listing.publishedAt : null}
            )
            RETURNING id
          `;

          for (const [sortOrder, url] of listing.photos.entries()) {
            await client`
              INSERT INTO listing_photos (listing_id, url, thumbnail_url, sort_order)
              VALUES (${row.id}, ${url}, ${url}, ${sortOrder})
            `;
          }
        }
        console.log(`Seeded ${DEMO_LISTINGS.length} sample listings`);
      } else {
        console.log("Skip listings (already present)");
      }
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
