/**
 * Footer “Stay updated” newsletter signup.
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { ValidationError } from "@/lib/errors";
import { emailService } from "@/lib/services/email.service";
import { newsletterSubscribeSchema } from "@/lib/validators";

export const newsletterService = {
  async subscribe(input: unknown): Promise<{
    subscribed: boolean;
    alreadySubscribed: boolean;
  }> {
    const parsed = newsletterSubscribeSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Enter a valid email address", {
        issues: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const db = getDb();

    const [existing] = await db
      .select({ id: newsletterSubscribers.id })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    if (existing) {
      return { subscribed: true, alreadySubscribed: true };
    }

    await db.insert(newsletterSubscribers).values({ email });
    await emailService.sendNewsletterConfirmation(email);

    return { subscribed: true, alreadySubscribed: false };
  },
};
