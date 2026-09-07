import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { DashPageHeader, DashPanel } from "@/components/dashboard/dash-primitives";

export default async function AdminProfilePage() {
  const session = await auth();
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <div className="space-y-7">
      <DashPageHeader
        title="Admin profile"
        description="Your HouseMe admin account details."
      />

      <DashPanel>
        <ProfileForm role="admin" initialName={name} initialEmail={email} />
      </DashPanel>
    </div>
  );
}
