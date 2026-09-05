"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function fieldMessage(fields?: Record<string, string[] | undefined>) {
  if (!fields) return null;
  const first = Object.values(fields).flat().find(Boolean);
  return first ?? null;
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(
    token ? null : "Missing reset token. Request a new link from forgot password.",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(
          fieldMessage(body?.error?.details?.fields) ??
            body?.error?.message ??
            "Could not reset password.",
        );
        setLoading(false);
        return;
      }

      router.push("/auth/login?registered=1");
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.28),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
      <h1 className="font-display text-2xl font-semibold text-ink">Set a new password</h1>
      <p className="mt-1 text-sm text-navy-600">
        Choose a strong password (8+ characters, uppercase, number, and symbol).
      </p>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-stamp/30 bg-stamp/10 px-3 py-2 text-sm text-ink"
          >
            {error}
          </p>
        ) : null}
        <Input
          name="password"
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          required
          disabled={loading || !token}
        />
        <Input
          name="confirm"
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          required
          disabled={loading || !token}
        />
        <Button
          type="submit"
          className="w-full"
          variant="stamp"
          disabled={loading || !token}
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
        <p className="text-center text-sm text-navy-600">
          <Link href="/auth/forgot-password" className="underline hover:text-ink">
            Request a new link
          </Link>
        </p>
      </form>
    </div>
  );
}
