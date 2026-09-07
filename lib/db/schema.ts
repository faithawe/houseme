import {
  bigint,
  boolean,
  check,
  customType,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const userRoleEnum = pgEnum("user_role", ["tenant", "landlord", "admin"]);

export const listingStatusEnum = pgEnum("listing_status", [
  "pending_review",
  "live",
  "rejected",
  "soft_deleted",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "self_con",
  "room",
  "flat",
  "mini_flat",
  "bungalow",
  "duplex",
]);

export const pricePeriodEnum = pgEnum("price_period", ["monthly", "yearly"]);

export const auditActionEnum = pgEnum("audit_action", [
  "approved",
  "rejected",
  "flagged",
  "soft_deleted",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: userRoleEnum("role").notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  failedLoginAttempts: smallint("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const landlordProfiles = pgTable("landlord_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  businessName: varchar("business_name", { length: 150 }),
  verified: boolean("verified").default(false).notNull(),
  bio: text("bio"),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 150 }).notNull(),
    description: text("description").notNull(),
    propertyType: propertyTypeEnum("property_type").notNull(),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    pricePeriod: pricePeriodEnum("price_period").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    area: varchar("area", { length: 100 }),
    address: text("address").notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    bedrooms: smallint("bedrooms").notNull(),
    bathrooms: smallint("bathrooms").notNull(),
    furnished: boolean("furnished").default(false).notNull(),
    amenities: text("amenities").array(),
    status: listingStatusEnum("status").default("pending_review").notNull(),
    rejectionReason: text("rejection_reason"),
    contactClicks: bigint("contact_clicks", { mode: "number" }).default(0).notNull(),
    viewCount: bigint("view_count", { mode: "number" }).default(0).notNull(),
    searchVector: tsvector("search_vector"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_listings_status").on(table.status),
    index("idx_listings_city").on(table.city),
    index("idx_listings_price").on(table.price),
    index("idx_listings_type").on(table.propertyType),
    index("idx_listings_composite").on(
      table.status,
      table.city,
      table.price,
      table.propertyType,
    ),
    index("idx_listings_landlord").on(table.landlordId),
    index("idx_listings_created").on(table.createdAt),
    check("check_price_positive", sql`${table.price} > 0`),
    check("check_bedrooms_non_negative", sql`${table.bedrooms} >= 0`),
    check("check_bathrooms_non_negative", sql`${table.bathrooms} >= 0`),
    check(
      "check_description_length",
      sql`char_length(${table.description}) >= 50 AND char_length(${table.description}) <= 2000`,
    ),
  ],
);

export const listingPhotos = pgTable(
  "listing_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_photos_listing").on(table.listingId)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unique_user_listing").on(table.userId, table.listingId),
    index("idx_favorites_user").on(table.userId),
  ],
);

export const listingAuditLog = pgTable(
  "listing_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id),
    action: auditActionEnum("action").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_listing").on(table.listingId),
    index("idx_audit_admin").on(table.adminId),
    index("idx_audit_created").on(table.createdAt),
  ],
);

export const contactEvents = pgTable(
  "contact_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    userId: uuid("user_id"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_contact_listing").on(table.listingId)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingPhoto = typeof listingPhotos.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
