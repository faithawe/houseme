"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { RoleSelector } from "@/components/auth/role-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatFields(fields?: Record<string, string[] | undefined>) {
  if (!fields) return null;
  const messages = Object.entries(fields)
    .flatMap(([key, value]) => (value ?? []).map((msg) => `${key}: ${msg}`))
    .slice(0, 3);
  return messages.length ? messages.join(" · ") : null;
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "tenant"),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(
          formatFields(body?.error?.details?.fields) ??
            body?.error?.message ??
            "Registration failed.",
        );
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
        callbackUrl: "/auth/callback",
      });

      if (result?.error || !result) {
        router.push("/auth/login?registered=1");
        return;
      }

      window.location.assign(result.url ?? "/auth/callback");
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
      {error ? (
        <p className="rounded-xl border border-stamp/30 bg-stamp/10 px-3 py-2 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <RoleSelector />
      <Input name="name" placeholder="Full name" required />
      <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
      <Input name="phone" type="tel" placeholder="Phone" required />
      <Input
        name="password"
        type="password"
        placeholder="Password (8+ chars, upper, number, symbol)"
        autoComplete="new-password"
        required
      />
      <Button type="submit" className="w-full" variant="stamp" disabled={loading}>
        {loading ? "Creating account…" : "Register"}
      </Button>
    </form>
  );
}

export function RegisterFooterLink() {
  return (
    <p className="mt-4 text-sm text-navy-600">
      Already have an account?{" "}
      <Link href="/auth/login" className="underline hover:text-ink">
        Log in
      </Link>
    </p>
  );
}
