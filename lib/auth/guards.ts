import type { UserRole } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.email || !user.name || !user.role) {
    throw new UnauthorizedError();
  }

  if (roles && !roles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
