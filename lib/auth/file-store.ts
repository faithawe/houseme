import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { UserRole } from "@/lib/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  ConflictError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { loginSchema, registerSchema } from "@/lib/validators";
import type { AuthUser } from "@/lib/services/auth.service";

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  deletedAt: string | null;
};

type StoreFile = { users: StoredUser[] };

const STORE_PATH = resolve(process.cwd(), ".data", "users.json");
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { users: [] };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function lockUntilFromNow(): string {
  return new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
}

export const fileAuthStore = {
  async register(input: unknown): Promise<{ userId: string }> {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid registration details", {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const store = await readStore();
    const email = data.email.toLowerCase();

    if (store.users.some((user) => user.email === email && !user.deletedAt)) {
      throw new ConflictError("An account with this email already exists");
    }

    const user: StoredUser = {
      id: randomUUID(),
      email,
      passwordHash: await hashPassword(data.password),
      name: data.name.trim(),
      phone: data.phone.trim(),
      role: data.role,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      deletedAt: null,
    };

    store.users.push(user);
    await writeStore(store);
    return { userId: user.id };
  },

  async authenticateCredentials(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return null;

    const store = await readStore();
    const normalizedEmail = parsed.data.email.toLowerCase();
    const user = store.users.find(
      (entry) => entry.email === normalizedEmail && !entry.deletedAt,
    );

    if (!user) return null;

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new RateLimitError(
        "Account is temporarily locked. Try again in a few minutes.",
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);

    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = lockUntilFromNow();
        await writeStore(store);
        throw new RateLimitError(
          "Too many failed attempts. Account locked for 15 minutes.",
        );
      }
      await writeStore(store);
      return null;
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError(
        "Verify your email before logging in.",
        "EMAIL_NOT_VERIFIED",
      );
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await writeStore(store);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },

  async ensureSeedUsers(): Promise<void> {
    const seeds = [
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

    for (const seed of seeds) {
      const store = await readStore();
      if (store.users.some((user) => user.email === seed.email)) continue;
      await this.register(seed);
    }
  },
};

export function useFileAuthStore(): boolean {
  return process.env.AUTH_STORE === "file";
}
