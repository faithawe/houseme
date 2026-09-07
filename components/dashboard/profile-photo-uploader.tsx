"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Camera, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  readProfilePhoto,
  writeProfilePhoto,
  type ProfileRole,
} from "@/lib/profile-photo-store";
import { uploadImageFile } from "@/lib/cloudinary-client";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 4 * 1024 * 1024;

function initialsFromName(name?: string) {
  if (!name?.trim()) return null;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || null;
}

type ProfilePhotoUploaderProps = {
  role: ProfileRole;
  userKey: string;
  displayName?: string;
  className?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** When true, photo is kept in parent state for API save (not localStorage-only). */
  syncRemote?: boolean;
};

export function ProfilePhotoUploader({
  role,
  userKey,
  displayName,
  className,
  value,
  onChange,
  syncRemote = false,
}: ProfilePhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initials = initialsFromName(displayName);
  const controlled = typeof onChange === "function";
  const photo = controlled ? (value ?? null) : localPhoto;

  useEffect(() => {
    if (controlled) return;
    setLocalPhoto(readProfilePhoto(role, userKey));
  }, [role, userKey, controlled]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Photo must be under 4MB.");
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await uploadImageFile(file, {
        preferDataUrl: !syncRemote,
      });
      if (controlled) {
        onChange?.(dataUrl);
      } else {
        writeProfilePhoto(role, userKey, dataUrl);
        setLocalPhoto(dataUrl);
      }
    } catch {
      setError("Could not process that photo. Try another file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto() {
    if (controlled) {
      onChange?.(null);
    } else {
      writeProfilePhoto(role, userKey, null);
      setLocalPhoto(null);
    }
    setError(null);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-line bg-[#fafafa]">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="96px"
          />
        ) : initials ? (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-stamp">
            {initials}
          </span>
        ) : (
          <span className="flex h-full w-full items-center justify-center text-navy-400">
            <UserRound className="h-9 w-9" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </div>

      <div className="min-w-0 space-y-2">
        <div>
          <p className="text-sm font-semibold text-ink">Profile photo</p>
          <p className="text-xs text-navy-400">
            JPG, PNG or WebP · under 4MB
            {syncRemote
              ? " · saved with your profile"
              : " · saved on this device for now"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="stamp" size="sm" disabled={busy}>
            <label htmlFor={inputId} className="cursor-pointer">
              <Camera className="h-3.5 w-3.5" aria-hidden />
              {photo ? "Change photo" : "Upload photo"}
            </label>
          </Button>
          {photo ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removePhoto}
              disabled={busy}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>
        {error ? <p className="text-xs text-stamp-700">{error}</p> : null}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}
