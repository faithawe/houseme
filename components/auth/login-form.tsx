"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function errorMessage(code?: string | null) {
  switch (code) {
    case "account_locked":
      return "Too many failed attempts. Try again in a few minutes.";
    case "email_not_verified":
      return "Verify your email before logging in.";
    case "Configuration":
      return "Auth is misconfigured. Check AUTH_SECRET and restart the server.";
    default:
      return "Invalid email or password.";
  }
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/callback";
  const registered = searchParams.get("registered") === "1";
  const needsVerify = searchParams.get("verify") === "1";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setError("Could not reach the auth server. Refresh and try again.");
        return;
      }

      if (result.error) {
        setError(errorMessage(result.code ?? result.error));
        return;
      }

      window.location.assign(result.url ?? "/auth/callback");
    } catch {
      setError("Something went wrong signing in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate={false}>
      {registered ? (
        <p className="rounded-xl border border-palm/30 bg-palm-100 px-3 py-2 text-sm text-ink">
          Account created. You can log in now.
        </p>
      ) : null}
      {needsVerify ? (
        <p className="rounded-xl border border-palm/30 bg-palm-100 px-3 py-2 text-sm text-ink">
          Check your inbox for a verification link, then log in.
        </p>
      ) : null}
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
        autoComplete="email"
        required
        disabled={loading}
      />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        disabled={loading}
      />
      <Button type="submit" className="w-full" variant="stamp" disabled={loading}>
        {loading ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}

export function LoginFooterLinks() {
  return (
    <p className="mt-4 text-sm text-navy-600">
      <Link href="/auth/forgot-password" className="underline hover:text-ink">
        Forgot password
      </Link>
    </p>
  );
}
