import { redirect } from "next/navigation";
import { auth, dashboardPathForRole } from "@/lib/auth";

export default async function AuthCallbackPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  redirect(dashboardPathForRole(session.user.role));
}
