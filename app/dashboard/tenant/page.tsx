import { auth } from "@/lib/auth";
import { TenantOverview } from "@/components/dashboard/tenant-overview";

export default async function TenantHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const params = await searchParams;
  const firstName =
    session?.user?.name?.trim().split(/\s+/)[0] || "there";
  const needLandlord = params.need === "landlord";

  return <TenantOverview firstName={firstName} needLandlord={needLandlord} />;
}
