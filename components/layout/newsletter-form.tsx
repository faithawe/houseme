"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(body?.error?.message ?? "Could not subscribe right now.");
        return;
      }

      if (body?.data?.alreadySubscribed) {
        setMessage("You're already on the list.");
      } else {
        setMessage("Subscribed — check your inbox for a confirmation.");
        setEmail("");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="border-white/20 bg-white text-ink placeholder:text-navy-400"
          aria-label="Email address"
          autoComplete="email"
          required
          disabled={loading}
        />
        <Button
          type="submit"
          variant="stamp"
          className="shrink-0"
          disabled={loading || !email.trim()}
        >
          {loading ? "…" : "Subscribe"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-stamp">
          {message}
        </p>
      ) : null}
    </form>
  );
}
