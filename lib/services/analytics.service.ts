/**
 * Listing view counts and contact-click events (first-party DB analytics).
 */
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contactEvents, listings } from "@/lib/db/schema";
import { NotFoundError } from "@/lib/errors";

export const analyticsService = {
  async trackView(listingId: string): Promise<{ ok: true }> {
    const db = getDb();
    const [row] = await db
      .update(listings)
      .set({ viewCount: sql`${listings.viewCount} + 1` })
      .where(eq(listings.id, listingId))
      .returning({ id: listings.id });

    if (!row) throw new NotFoundError("Listing not found");
    return { ok: true };
  },

  async trackContact(
    listingId: string,
    userId?: string | null,
    userAgent?: string | null,
  ): Promise<{ ok: true }> {
    const db = getDb();
    const [listing] = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) throw new NotFoundError("Listing not found");

    await db.insert(contactEvents).values({
      listingId,
      userId: userId ?? null,
      userAgent: userAgent ?? null,
    });

    await db
      .update(listings)
      .set({ contactClicks: sql`${listings.contactClicks} + 1` })
      .where(eq(listings.id, listingId));

    return { ok: true };
  },
};
