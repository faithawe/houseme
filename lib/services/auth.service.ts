import { and, eq, gt } from "drizzle-orm";
import type { UserRole } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { landlordProfiles, passwordResetTokens, users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { appBaseUrl, createRawToken, hashToken } from "@/lib/auth/tokens";
import {
  demoConsumeResetToken,
  demoCreateResetToken,
  demoCreateUser,
  demoFindByEmail,
  demoUpdateUser,
  ensureDemoUsersSeeded,
  isDemoAuthMode,
} from "@/lib/auth/demo-store";
import { emailService } from "@/lib/services/email.service";
import {
  ConflictError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const RESET_TOKEN_HOURS = 1;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

function lockUntilFromNow(): Date {
  return new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
}

function resetExpiry(): Date {
  return new Date(Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000);
}

export const authService = {
  async register(input: unknown): Promise<{ userId: string; email: string }> {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid registration details", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const email = data.email.trim().toLowerCase();
    const passwordHash = await hashPassword(data.password);

    if (isDemoAuthMode()) {
      await ensureDemoUsersSeeded();
      try {
        const user = await demoCreateUser({
          email,
          passwordHash,
          name: data.name.trim(),
          phone: data.phone.trim(),
          role: data.role,
        });
        return { userId: user.id, email: user.email };
      } catch {
        throw new ConflictError("An account with this email already exists");
      }
    }

    const db = getDb();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: data.name.trim(),
        phone: data.phone.trim(),
        role: data.role,
        emailVerified: true,
      })
      .returning({ id: users.id, email: users.email });

    if (data.role === "landlord") {
      await db.insert(landlordProfiles).values({ userId: user.id });
    }

    return { userId: user.id, email: user.email };
  },

  async authenticateCredentials(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      return null;
    }

    const normalizedEmail = parsed.data.email.toLowerCase();

    if (isDemoAuthMode()) {
      await ensureDemoUsersSeeded();
      const user = await demoFindByEmail(normalizedEmail);
      if (!user || user.deletedAt) return null;

      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new RateLimitError(
          "Account is temporarily locked. Try again in a few minutes.",
        );
      }

      const valid = await verifyPassword(parsed.data.password, user.passwordHash);
      if (!valid) {
        const attempts = user.failedLoginAttempts + 1;
        const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
        await demoUpdateUser(user.id, {
          failedLoginAttempts: attempts,
          lockedUntil: shouldLock ? lockUntilFromNow().toISOString() : null,
        });
        if (shouldLock) {
          throw new RateLimitError(
            "Too many failed attempts. Account locked for 15 minutes.",
          );
        }
        return null;
      }

      if (!user.emailVerified) {
        throw new UnauthorizedError(
          "Verify your email before logging in.",
          "EMAIL_NOT_VERIFIED",
        );
      }

      if (user.failedLoginAttempts > 0 || user.lockedUntil) {
        await demoUpdateUser(user.id, {
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user || user.deletedAt) {
      return null;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new RateLimitError(
        "Account is temporarily locked. Try again in a few minutes.",
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);

    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

      await db
        .update(users)
        .set({
          failedLoginAttempts: attempts,
          lockedUntil: shouldLock ? lockUntilFromNow() : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      if (shouldLock) {
        throw new RateLimitError(
          "Too many failed attempts. Account locked for 15 minutes.",
        );
      }

      return null;
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError(
        "Verify your email before logging in.",
        "EMAIL_NOT_VERIFIED",
      );
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await db
        .update(users)
        .set({
          failedLoginAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },

  /**
   * Always returns generic success. When a matching account exists, includes
   * `resetUrl` so local/dev can reset without a mail provider.
   */
  async requestPasswordReset(
    input: unknown,
  ): Promise<{ ok: true; resetUrl?: string }> {
    const parsed = forgotPasswordSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Enter a valid email address", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const rawToken = createRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = resetExpiry();
    const resetUrl = `${appBaseUrl()}/auth/reset-password?token=${rawToken}`;

    if (isDemoAuthMode()) {
      await ensureDemoUsersSeeded();
      const user = await demoFindByEmail(email);
      if (!user || user.deletedAt) {
        return { ok: true };
      }
      await demoCreateResetToken({
        userId: user.id,
        tokenHash,
        expiresAt,
      });
      await emailService.sendPasswordReset(user.email, resetUrl);
      return { ok: true, resetUrl };
    }

    const db = getDb();
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { ok: true };
    }

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    });

    await emailService.sendPasswordReset(user.email, resetUrl);
    return { ok: true, resetUrl };
  },

  async resetPassword(input: unknown): Promise<{ ok: true }> {
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid password reset details", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const tokenHash = hashToken(parsed.data.token);
    const passwordHash = await hashPassword(parsed.data.password);

    if (isDemoAuthMode()) {
      const userId = await demoConsumeResetToken(tokenHash);
      if (!userId) {
        throw new ValidationError("This reset link is invalid or has expired.");
      }
      await demoUpdateUser(userId, { passwordHash });
      return { ok: true };
    }

    const db = getDb();
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!token) {
      throw new ValidationError("This reset link is invalid or has expired.");
    }

    await db
      .update(users)
      .set({
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, token.userId));

    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, token.id));

    return { ok: true };
  },

  async verifyEmail(_token: string): Promise<never> {
    throw new Error("authService.verifyEmail is not implemented");
  },
};
