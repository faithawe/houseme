import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { landlordProfiles, users } from "@/lib/db/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { profileUpdateSchema } from "@/lib/validators";
import type { UserRole } from "@/lib/constants";

export type ProfileDto = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl: string | null;
  businessName: string | null;
  bio: string | null;
};

export const profileService = {
  async getByUserId(userId: string): Promise<ProfileDto> {
    const db = getDb();
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
        avatarUrl: users.avatarUrl,
        businessName: landlordProfiles.businessName,
        bio: landlordProfiles.bio,
      })
      .from(users)
      .leftJoin(landlordProfiles, eq(landlordProfiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!row || row.id === undefined) {
      throw new NotFoundError("Profile not found");
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      role: row.role,
      avatarUrl: row.avatarUrl,
      businessName: row.businessName ?? null,
      bio: row.bio ?? null,
    };
  },

  async update(userId: string, input: unknown): Promise<ProfileDto> {
    const parsed = profileUpdateSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid profile details", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const db = getDb();
    const [current] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!current || current.deletedAt) {
      throw new NotFoundError("Profile not found");
    }

    const data = parsed.data;
    const userPatch: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) userPatch.name = data.name.trim();
    if (data.phone !== undefined) userPatch.phone = data.phone.trim();
    if (data.avatarUrl !== undefined) userPatch.avatarUrl = data.avatarUrl;

    await db.update(users).set(userPatch).where(eq(users.id, userId));

    if (current.role === "landlord") {
      const [profile] = await db
        .select()
        .from(landlordProfiles)
        .where(eq(landlordProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        await db.insert(landlordProfiles).values({
          userId,
          businessName: data.businessName?.trim() || null,
          bio: data.bio?.trim() || null,
        });
      } else if (data.businessName !== undefined || data.bio !== undefined) {
        await db
          .update(landlordProfiles)
          .set({
            businessName:
              data.businessName !== undefined
                ? data.businessName?.trim() || null
                : profile.businessName,
            bio: data.bio !== undefined ? data.bio?.trim() || null : profile.bio,
          })
          .where(eq(landlordProfiles.userId, userId));
      }
    }

    return this.getByUserId(userId);
  },
};
