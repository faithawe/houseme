import { UnauthorizedError } from "@/lib/errors";
import { jsonError } from "@/lib/api-response";

/** Legacy route — login uses NextAuth at /api/auth/[...nextauth] */
export async function POST() {
  return jsonError(new UnauthorizedError("Use the login form on /auth/login."));
}
