import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { DashPageHeader, DashPanel } from "@/components/dashboard/dash-primitives";

export default async function LandlordProfilePage() {
  const session = await auth();
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <div className="space-y-7">
      <DashPageHeader
        title="Landlord profile"
        description="Tenants see your name and phone on live listings."
      />

      <DashPanel>
        <ProfileForm role="landlord" initialName={name} initialEmail={email} />
      </DashPanel>
    </div>
  );
}
