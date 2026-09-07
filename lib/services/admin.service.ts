/**
 * Admin review queue: approve, reject (reason required), flag, stats.
 */
import { and, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  listingAuditLog,
  listingPhotos,
  listings,
  users,
} from "@/lib/db/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { rejectListingSchema } from "@/lib/validators";
import { emailService } from "@/lib/services/email.service";

export type AdminListingRow = {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  price: number;
  pricePeriod: string;
  city: string;
  area: string | null;
  address: string;
  photo: string | null;
  photos: string[];
  status: "pending_review" | "live" | "rejected";
  rejectionReason: string | null;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  submittedAt: string;
  viewCount: number;
  contactClicks: number;
};

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

async function getListingOrThrow(listingId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, listingId), isNull(listings.deletedAt)))
    .limit(1);
  if (!row || row.status === "soft_deleted") {
    throw new NotFoundError("Listing not found");
  }
  return row;
}

export const adminService = {
  async listListings(status?: string): Promise<AdminListingRow[]> {
    const db = getDb();
    const conditions = [
      isNull(listings.deletedAt),
      ne(listings.status, "soft_deleted"),
    ];

    if (
      status === "pending_review" ||
      status === "live" ||
      status === "rejected"
    ) {
      conditions.push(eq(listings.status, status));
    }

    const rows = await db
      .select({
        listing: listings,
        landlordName: users.name,
        landlordEmail: users.email,
        landlordPhone: users.phone,
      })
      .from(listings)
      .innerJoin(users, eq(users.id, listings.landlordId))
      .where(and(...conditions))
      .orderBy(desc(listings.updatedAt));

    const ids = rows.map((r) => r.listing.id);
    const photoRows =
      ids.length === 0
        ? []
        : await db
            .select()
            .from(listingPhotos)
            .where(inArray(listingPhotos.listingId, ids))
            .orderBy(listingPhotos.sortOrder);

    const photosByListing = new Map<string, string[]>();
    for (const photo of photoRows) {
      const list = photosByListing.get(photo.listingId) ?? [];
      list.push(photo.url);
      photosByListing.set(photo.listingId, list);
    }

    return rows.map(({ listing, landlordName, landlordEmail, landlordPhone }) => {
      const photos = photosByListing.get(listing.id) ?? [];
      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        propertyType: listing.propertyType,
        price: toNumber(listing.price),
        pricePeriod: listing.pricePeriod,
        city: listing.city,
        area: listing.area,
        address: listing.address,
        photo: photos[0] ?? null,
        photos,
        status: listing.status as AdminListingRow["status"],
        rejectionReason: listing.rejectionReason,
        landlordName,
        landlordEmail,
        landlordPhone,
        submittedAt: (listing.createdAt ?? new Date()).toISOString().slice(0, 10),
        viewCount: listing.viewCount,
        contactClicks: listing.contactClicks,
      };
    });
  },

  async approve(listingId: string, adminId: string) {
    const db = getDb();
    await getListingOrThrow(listingId);

    const [row] = await db
      .update(listings)
      .set({
        status: "live",
        rejectionReason: null,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning();

    await db.insert(listingAuditLog).values({
      listingId,
      adminId,
      action: "approved",
    });

    const [landlord] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, row.landlordId))
      .limit(1);
    if (landlord?.email) {
      try {
        await emailService.sendListingApproved(landlord.email, listingId);
      } catch (error) {
        console.warn("[admin] approve email failed", error);
      }
    }

    return { id: row.id, status: row.status };
  },

  async reject(listingId: string, adminId: string, reasonInput: unknown) {
    const parsed = rejectListingSchema.safeParse(
      typeof reasonInput === "string" ? { reason: reasonInput } : reasonInput,
    );
    if (!parsed.success) {
      throw new ValidationError("A rejection reason is required", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const db = getDb();
    await getListingOrThrow(listingId);

    const [row] = await db
      .update(listings)
      .set({
        status: "rejected",
        rejectionReason: parsed.data.reason.trim(),
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning();

    await db.insert(listingAuditLog).values({
      listingId,
      adminId,
      action: "rejected",
      reason: parsed.data.reason.trim(),
    });

    const [landlord] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, row.landlordId))
      .limit(1);
    if (landlord?.email) {
      try {
        await emailService.sendListingRejected(
          landlord.email,
          listingId,
          parsed.data.reason.trim(),
        );
      } catch (error) {
        console.warn("[admin] reject email failed", error);
      }
    }

    return { id: row.id, status: row.status, rejectionReason: row.rejectionReason };
  },

  async flag(listingId: string, adminId: string) {
    const db = getDb();
    const listing = await getListingOrThrow(listingId);

    await db
      .update(listings)
      .set({
        status: "pending_review",
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId));

    await db.insert(listingAuditLog).values({
      listingId,
      adminId,
      action: "flagged",
      reason: listing.status === "live" ? "Flagged while live" : "Flagged for re-review",
    });

    return { id: listingId, status: "pending_review" as const };
  },

  async stats() {
    const db = getDb();
    const [counts] = await db
      .select({
        pending: sql<number>`count(*) filter (where ${listings.status} = 'pending_review')::int`,
        live: sql<number>`count(*) filter (where ${listings.status} = 'live')::int`,
        rejected: sql<number>`count(*) filter (where ${listings.status} = 'rejected')::int`,
        total: sql<number>`count(*) filter (where ${listings.status} <> 'soft_deleted')::int`,
      })
      .from(listings)
      .where(isNull(listings.deletedAt));

    const [userCounts] = await db
      .select({
        tenants: sql<number>`count(*) filter (where ${users.role} = 'tenant')::int`,
        landlords: sql<number>`count(*) filter (where ${users.role} = 'landlord')::int`,
        admins: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
      })
      .from(users)
      .where(isNull(users.deletedAt));

    return {
      listings: counts,
      users: userCounts,
    };
  },
};
