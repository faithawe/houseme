"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
        Error
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-navy">
        Something went wrong
      </h1>
      <p className="mt-3 text-navy/70">Our team has been notified. Try again.</p>
      <Button className="mt-6" type="button" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}
