"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "houseme:favorites";
const EVENT = "houseme:favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function useFavoriteIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(readFavorites());
    sync();

    async function loadRemote() {
      try {
        const response = await fetch("/api/favorites");
        if (!response.ok) return;
        const json = (await response.json()) as { data: { id: string }[] };
        const remoteIds = json.data.map((item) => item.id);
        writeFavorites(remoteIds);
        setIds(remoteIds);
      } catch {
        // keep local
      }
    }

    void loadRemote();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return ids;
}

export function FavoriteButton({
  listingId,
  className,
}: {
  listingId: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readFavorites().includes(listingId));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [listingId]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const current = readFavorites();
        const isSaved = current.includes(listingId);
        const next = isSaved
          ? current.filter((id) => id !== listingId)
          : [...current, listingId];
        writeFavorites(next);
        setSaved(!isSaved);

        void (async () => {
          try {
            await fetch(`/api/favorites/${listingId}`, {
              method: isSaved ? "DELETE" : "POST",
            });
          } catch {
            // local-only fallback already applied
          }
        })();
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm backdrop-blur transition hover:scale-105",
        saved && "text-stamp",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-stamp")} />
    </button>
  );
}
