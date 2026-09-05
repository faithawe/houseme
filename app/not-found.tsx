import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stamp">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-navy">
        Listing not found
      </h1>
      <p className="mt-3 text-navy/70">
        It may have been removed, or the link is wrong.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to HouseMe</Link>
      </Button>
    </div>
  );
}
