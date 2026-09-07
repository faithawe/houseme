import { and, count, desc, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { listings, users } from "@/lib/db/schema";
import { NotFoundError } from "@/lib/errors";
import type { AdminUserRow } from "@/lib/admin-demo";

export const adminUsersService = {
  async list(): Promise<AdminUserRow[]> {
    const db = getDb();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(isNull(users.deletedAt), ne(users.role, "admin")))
      .orderBy(desc(users.createdAt));

    const listingCounts = await db
      .select({
        landlordId: listings.landlordId,
        total: count(),
      })
      .from(listings)
      .where(and(isNull(listings.deletedAt), ne(listings.status, "soft_deleted")))
      .groupBy(listings.landlordId);

    const countByLandlord = new Map(
      listingCounts.map((row) => [row.landlordId, Number(row.total)]),
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      joinedAt: row.createdAt.toISOString().slice(0, 10),
      lastActive: row.createdAt.toISOString().slice(0, 10),
      listingsCount: countByLandlord.get(row.id) ?? 0,
      status: "active" as const,
    }));
  },

  async softDelete(userId: string) {
    const db = getDb();
    const [row] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!row || row.role === "admin") {
      throw new NotFoundError("User not found");
    }

    await db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));

    return { id: userId };
  },
};
