import { auth } from "@/lib/auth";
import { LandlordOverview } from "@/components/dashboard/landlord-overview";

export default async function LandlordHomePage() {
  const session = await auth();
  const firstName =
    session?.user?.name?.trim().split(/\s+/)[0] || "Landlord";

  return <LandlordOverview firstName={firstName} />;
}
