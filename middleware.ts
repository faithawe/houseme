import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig, dashboardPathForRole } from "@/lib/auth/config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(
      new URL(dashboardPathForRole(role), request.nextUrl.origin),
    );
  }

  if (
    pathname.startsWith("/dashboard/landlord") &&
    role !== "landlord" &&
    role !== "admin"
  ) {
    // Tenants hitting landlord links get a clear notice instead of a silent bounce
    if (role === "tenant") {
      return NextResponse.redirect(
        new URL("/dashboard/tenant?need=landlord", request.nextUrl.origin),
      );
    }
    return NextResponse.redirect(
      new URL(dashboardPathForRole(role), request.nextUrl.origin),
    );
  }

  if (pathname.startsWith("/dashboard/tenant") && role === "landlord") {
    return NextResponse.redirect(
      new URL("/dashboard/landlord", request.nextUrl.origin),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
