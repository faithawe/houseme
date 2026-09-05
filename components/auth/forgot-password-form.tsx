"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setDone(false);
    setResetUrl(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(body?.error?.message ?? "Could not start password reset.");
        return;
      }

      setDone(true);
      if (typeof body?.data?.resetUrl === "string") {
        setResetUrl(body.data.resetUrl);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.28),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
      <h1 className="font-display text-2xl font-semibold text-ink">Forgot password</h1>
      <p className="mt-1 text-sm text-navy-600">
        Enter the email on your HouseMe account. If it exists, you can set a new
        password.
      </p>

      {done ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-xl border border-palm/30 bg-palm-100 px-3 py-2 text-sm text-ink">
            If an account exists for that email, a reset link is ready.
          </p>
          {resetUrl ? (
            <p className="break-all rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy-600">
              Local reset link (email not wired yet):{" "}
              <Link href={resetUrl} className="font-semibold text-stamp underline">
                Set a new password
              </Link>
            </p>
          ) : (
            <p className="text-sm text-navy-600">
              No matching account was found for that email, or the link was only
              sent to the server log.
            </p>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to log in</Link>
          </Button>
        </div>
      ) : (
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
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />
          <Button type="submit" className="w-full" variant="stamp" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-navy-600">
            <Link href="/auth/login" className="underline hover:text-ink">
              Back to log in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
