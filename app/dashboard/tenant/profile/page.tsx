import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePhotoUploader } from "@/components/dashboard/profile-photo-uploader";
import { DashPageHeader, DashPanel } from "@/components/dashboard/dash-primitives";

export default async function TenantProfilePage() {
  const session = await auth();
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const userKey = email || name || "tenant-demo";

  return (
    <div className="space-y-7">
      <DashPageHeader
        title="Tenant profile"
        description="Account details for searching and saving verified rooms."
      />

      <DashPanel>
        <form className="space-y-5 px-4 py-5 sm:px-5" action="#">
          <ProfilePhotoUploader
            role="tenant"
            userKey={userKey}
            displayName={name}
          />

          <div className="border-t border-line pt-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
              Display name
            </label>
            <Input name="name" defaultValue={name} readOnly />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
              Email
            </label>
            <Input name="email" type="email" defaultValue={email} readOnly />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
              Phone (WhatsApp)
            </label>
            <Input name="phone" type="tel" placeholder="+234…" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" variant="stamp" disabled>
              Save profile
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/forgot-password">Change password</Link>
            </Button>
          </div>
          <p className="text-xs text-navy-400">
            Profile save connects once the tenant profile API is live. Photos are
            stored on this device for now.
          </p>
        </form>
      </DashPanel>
    </div>
  );
}
