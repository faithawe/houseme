import { auth } from "@/lib/auth";
import { AdminOverview } from "@/components/dashboard/admin-overview";

export default async function AdminHomePage() {
  const session = await auth();
  const firstName =
    session?.user?.name?.trim().split(/\s+/)[0] || "Admin";

  return <AdminOverview firstName={firstName} />;
}
