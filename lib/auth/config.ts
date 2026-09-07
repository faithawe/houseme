import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/lib/constants";

export function dashboardPathForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "landlord":
      return "/dashboard/landlord";
    default:
      return "/dashboard/tenant";
  }
}

/** Edge-safe Auth.js config — no Node APIs, no DB imports. */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (typeof session.email === "string") token.email = session.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        if (
          token.role === "tenant" ||
          token.role === "landlord" ||
          token.role === "admin"
        ) {
          session.user.role = token.role as UserRole;
        }
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (!pathname.startsWith("/dashboard")) {
        return true;
      }
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
