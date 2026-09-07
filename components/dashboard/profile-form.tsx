"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfilePhotoUploader } from "@/components/dashboard/profile-photo-uploader";
import type { ProfileRole } from "@/lib/profile-photo-store";

type ProfileData = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: ProfileRole;
  avatarUrl: string | null;
  businessName: string | null;
  bio: string | null;
};

export function ProfileForm({
  role,
  initialName,
  initialEmail,
}: {
  role: ProfileRole;
  initialName: string;
  initialEmail: string;
}) {
  const { update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Failed to load profile");
        const json = (await response.json()) as { data: ProfileData };
        if (cancelled) return;
        setName(json.data.name);
        setPhone(json.data.phone);
        setBusinessName(json.data.businessName ?? "");
        setBio(json.data.bio ?? "");
        setAvatarUrl(json.data.avatarUrl);
      } catch {
        if (!cancelled) setMessage("Could not load profile from the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          avatarUrl,
          ...(role === "landlord"
            ? { businessName: businessName || null, bio: bio || null }
            : {}),
        }),
      });
      const json = (await response.json()) as {
        data?: ProfileData;
        error?: { message?: string };
      };
      if (!response.ok) {
        setMessage(json.error?.message ?? "Could not save profile.");
        return;
      }
      if (json.data) {
        setName(json.data.name);
        setPhone(json.data.phone);
        setBusinessName(json.data.businessName ?? "");
        setBio(json.data.bio ?? "");
        setAvatarUrl(json.data.avatarUrl);
        await update({ name: json.data.name, email: json.data.email });
      }
      setMessage("Profile saved.");
    } catch {
      setMessage("Could not save profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-line bg-white" />;
  }

  return (
    <form className="space-y-5 px-4 py-5 sm:px-5" onSubmit={onSubmit}>
      <ProfilePhotoUploader
        role={role}
        userKey={initialEmail || initialName}
        displayName={name}
        value={avatarUrl}
        onChange={setAvatarUrl}
        syncRemote
      />

      <div className="border-t border-line pt-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
          Display name
        </label>
        <Input
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
          Email
        </label>
        <Input name="email" type="email" value={initialEmail} readOnly />
      </div>
      {role === "landlord" ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
            Business name
          </label>
          <Input
            name="businessName"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="e.g. Adeyemi Housing"
          />
        </div>
      ) : null}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
          Phone (WhatsApp)
        </label>
        <Input
          name="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+234…"
          required
        />
      </div>
      {role === "landlord" ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
            Short bio
          </label>
          <Textarea
            name="bio"
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Where you list, who you rent to, and what tenants can expect."
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" variant="stamp" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/forgot-password">Change password</Link>
        </Button>
      </div>
      {message ? <p className="text-xs text-navy-600">{message}</p> : null}
    </form>
  );
}
