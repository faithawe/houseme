import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { authService } from "@/lib/services/auth.service";
import { RateLimitError, UnauthorizedError } from "@/lib/errors";

class AccountLockedError extends CredentialsSignin {
  code = "account_locked";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        try {
          const user = await authService.authenticateCredentials(email, password);
          if (!user) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof RateLimitError) {
            throw new AccountLockedError();
          }
          if (error instanceof UnauthorizedError) {
            throw new EmailNotVerifiedError();
          }
          console.error("[auth] authorize failed:", error);
          return null;
        }
      },
    }),
  ],
});

export { dashboardPathForRole } from "@/lib/auth/config";
