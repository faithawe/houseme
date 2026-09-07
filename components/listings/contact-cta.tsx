"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

function toWhatsApp(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function ContactCta({
  listingId,
  phone,
  landlordName,
}: {
  listingId?: string;
  phone: string;
  landlordName: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function reveal() {
    setRevealed(true);
    if (!listingId) return;
    try {
      await fetch(`/api/listings/${listingId}/contact`, { method: "POST" });
    } catch {
      // analytics best-effort
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-slip">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-navy/40">
        Landlord
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-navy">{landlordName}</p>
      <p className="mt-1 text-sm text-navy/60">
        Call or WhatsApp to arrange a visit. HouseMe does not take a fee.
      </p>

      {!revealed ? (
        <Button className="mt-4 w-full" variant="stamp" onClick={reveal}>
          <Phone className="h-4 w-4" />
          Contact landlord
        </Button>
      ) : (
        <div className="mt-4 space-y-2">
          <a
            href={`tel:${phone}`}
            className="flex h-11 items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white"
          >
            {phone}
          </a>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(phone);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy number"}
            </Button>
            <Button asChild>
              <a href={toWhatsApp(phone)} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
