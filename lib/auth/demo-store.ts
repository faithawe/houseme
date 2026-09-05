import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { UserRole } from "@/lib/constants";
import { hashPassword } from "@/lib/auth/password";

export type StoredUser = {
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

const DATA_DIR = resolve(process.cwd(), ".data");
const USERS_FILE = resolve(DATA_DIR, "demo-users.json");
const RESET_FILE = resolve(DATA_DIR, "demo-reset-tokens.json");

type StoredResetToken = {
  tokenHash: string;
  userId: string;
  expiresAt: string;
  used: boolean;
};

function ensureStore(): StoredUser[] {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(USERS_FILE)) {
    writeFileSync(USERS_FILE, "[]", "utf8");
  }
  return JSON.parse(readFileSync(USERS_FILE, "utf8")) as StoredUser[];
}

function saveStore(users: StoredUser[]) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function ensureResetStore(): StoredResetToken[] {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(RESET_FILE)) {
    writeFileSync(RESET_FILE, "[]", "utf8");
  }
  return JSON.parse(readFileSync(RESET_FILE, "utf8")) as StoredResetToken[];
}

function saveResetStore(tokens: StoredResetToken[]) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(RESET_FILE, JSON.stringify(tokens, null, 2), "utf8");
}

export function isDemoAuthMode() {
  return process.env.AUTH_DEMO_MODE === "true" || process.env.AUTH_DEMO_MODE === "1";
}

export async function demoFindByEmail(email: string): Promise<StoredUser | null> {
  const users = ensureStore();
  return users.find((user) => user.email === email.toLowerCase()) ?? null;
}

export async function demoCreateUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  role: UserRole;
}): Promise<StoredUser> {
  const users = ensureStore();
  if (users.some((user) => user.email === input.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    name: input.name,
    phone: input.phone,
    role: input.role,
    emailVerified: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    deletedAt: null,
  };

  users.push(user);
  saveStore(users);
  return user;
}

export async function demoUpdateUser(
  id: string,
  patch: Partial<
    Pick<
      StoredUser,
      | "failedLoginAttempts"
      | "lockedUntil"
      | "emailVerified"
      | "passwordHash"
    >
  >,
) {
  const users = ensureStore();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return;
  users[index] = { ...users[index], ...patch };
  saveStore(users);
}

export async function demoCreateResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const tokens = ensureResetStore().filter((token) => token.userId !== input.userId);
  tokens.push({
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt.toISOString(),
    used: false,
  });
  saveResetStore(tokens);
}

export async function demoConsumeResetToken(tokenHash: string) {
  const tokens = ensureResetStore();
  const index = tokens.findIndex(
    (token) =>
      token.tokenHash === tokenHash &&
      !token.used &&
      new Date(token.expiresAt) > new Date(),
  );
  if (index === -1) return null;
  tokens[index] = { ...tokens[index], used: true };
  saveResetStore(tokens);
  return tokens[index].userId;
}

export async function ensureDemoUsersSeeded() {
  const users = ensureStore();
  if (users.length > 0) return;

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
    await demoCreateUser({
      email: seed.email,
      passwordHash: await hashPassword(seed.password),
      name: seed.name,
      phone: seed.phone,
      role: seed.role,
    });
  }
}
