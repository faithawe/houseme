"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("This verification link is missing a token.");
        return;
      }
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = (await response.json()) as {
          error?: { message?: string };
        };
        if (cancelled) return;
        if (!response.ok) {
          setStatus("error");
          setMessage(json.error?.message ?? "Verification failed.");
          return;
        }
        setStatus("ok");
        setMessage("Email verified. You can log in now.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not verify email. Try again later.");
        }
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
        Email
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        {status === "ok"
          ? "You're verified"
          : status === "error"
            ? "Verification issue"
            : "Verifying…"}
      </h1>
      <p className="mt-3 text-sm text-navy-600">{message}</p>
      <div className="mt-8 flex justify-center gap-2">
        <Button asChild variant="stamp">
          <Link href="/auth/login">Go to login</Link>
        </Button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-navy-600">
          Verifying…
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
