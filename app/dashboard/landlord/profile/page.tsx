import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfilePhotoUploader } from "@/components/dashboard/profile-photo-uploader";
import { DashPageHeader, DashPanel } from "@/components/dashboard/dash-primitives";

export default async function LandlordProfilePage() {
  const session = await auth();
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const userKey = email || name || "landlord-demo";

  return (
    <div className="space-y-7">
      <DashPageHeader
        title="Landlord profile"
        description="Tenants see your name and phone on live listings. Business details stay on your desk until save is wired."
      />

      <DashPanel>
        <form className="space-y-5 px-4 py-5 sm:px-5" action="#">
          <ProfilePhotoUploader
            role="landlord"
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
              Business name
            </label>
            <Input name="businessName" placeholder="e.g. Adeyemi Housing" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
              Phone (WhatsApp)
            </label>
            <Input name="phone" type="tel" placeholder="+234…" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
              Short bio
            </label>
            <Textarea
              name="bio"
              rows={4}
              placeholder="Where you list, who you rent to, and what tenants can expect."
            />
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
            Saving connects once the landlord profile API is live. Photos are
            stored on this device for now.
          </p>
        </form>
      </DashPanel>
    </div>
  );
}
