import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { DashPageHeader, DashPanel } from "@/components/dashboard/dash-primitives";

export default async function TenantProfilePage() {
  const session = await auth();
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <div className="space-y-7">
      <DashPageHeader
        title="Tenant profile"
        description="Account details for searching and saving verified rooms."
      />

      <DashPanel>
        <ProfileForm role="tenant" initialName={name} initialEmail={email} />
      </DashPanel>
    </div>
  );
}
