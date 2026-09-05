"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingGallery({
  title,
  photos,
}: {
  title: string;
  photos: string[];
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") {
        setActive((index) => (index + 1) % photos.length);
      }
      if (event.key === "ArrowLeft") {
        setActive((index) => (index - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  const go = (direction: -1 | 1) => {
    setActive((index) => (index + direction + photos.length) % photos.length);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-photocopy"
        aria-label="Open photo gallery"
      >
        <Image
          src={photos[active]}
          alt={`${title} photo ${active + 1}`}
          fill
          priority
          className="object-cover transition duration-500 motion-safe:group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 800px"
        />
        <span className="absolute bottom-3 right-3 rounded-xl bg-navy/80 px-2 py-1 text-[11px] font-semibold text-white">
          {active + 1} / {photos.length} · Open
        </span>
      </button>

      <div className="mt-2 flex gap-2 overflow-x-auto">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2",
              index === active ? "border-stamp" : "border-transparent",
            )}
            aria-label={`Show photo ${index + 1}`}
          >
            <Image src={photo} alt="" fill className="object-cover" sizes="96px" />
          </button>
        ))}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          <button
            type="button"
            className="absolute right-4 top-4 text-white"
            onClick={() => setOpen(false)}
            aria-label="Close gallery"
          >
            <X />
          </button>
          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-navy/70 p-2 text-white"
            onClick={() => go(-1)}
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <div className="relative h-[70vh] w-full max-w-5xl">
            <Image
              src={photos[active]}
              alt={`${title} photo ${active + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-navy/70 p-2 text-white"
            onClick={() => go(1)}
            aria-label="Next photo"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
