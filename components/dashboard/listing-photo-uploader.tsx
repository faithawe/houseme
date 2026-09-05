"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const MAX_LISTING_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4MB before compress
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/** Compress to JPEG data URL so drafts fit in localStorage. */
async function compressImage(file: File, maxEdge = 1280, quality = 0.72): Promise<string> {
  const source = await readFileAsDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Invalid image"));
    el.src = source;
  });

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

type ListingPhotoUploaderProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  required?: boolean;
  className?: string;
};

export function ListingPhotoUploader({
  photos,
  onChange,
  required = true,
  className,
}: ListingPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;

    setError(null);
    const slots = MAX_LISTING_PHOTOS - photos.length;
    if (slots <= 0) {
      setError(`You can add up to ${MAX_LISTING_PHOTOS} photos.`);
      return;
    }

    const picked = files.slice(0, slots);
    const oversized = picked.find((file) => file.size > MAX_PHOTO_BYTES);
    if (oversized) {
      setError("Each photo must be under 4MB before upload.");
      return;
    }

    const notImage = picked.find((file) => !file.type.startsWith("image/"));
    if (notImage) {
      setError("Only image files are allowed (JPG, PNG, WebP).");
      return;
    }

    setBusy(true);
    try {
      const compressed = await Promise.all(picked.map((file) => compressImage(file)));
      onChange([...photos, ...compressed]);
      if (files.length > slots) {
        setError(`Only ${slots} more photo${slots === 1 ? "" : "s"} could be added.`);
      }
    } catch {
      setError("Could not process one of the photos. Try another file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void addFiles(event.target.files);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files?.length) void addFiles(event.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(photos.filter((_, i) => i !== index));
    setError(null);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...photos];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
            House photos{required ? " *" : ""}
          </p>
          <p className="mt-1 text-sm text-navy-600">
            Add clear photos of the exterior, rooms, kitchen, and bathroom. First
            photo is the cover. {photos.length}/{MAX_LISTING_PHOTOS}
          </p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition",
          dragging
            ? "border-stamp bg-stamp/10"
            : "border-line bg-[#fafafa] hover:border-stamp/60 hover:bg-palm-100/40",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <ImagePlus className="h-7 w-7 text-stamp" aria-hidden />
        <p className="text-sm font-medium text-ink">
          {busy ? "Processing photos…" : "Drop photos here or click to browse"}
        </p>
        <p className="text-xs text-navy-400">JPG, PNG, or WebP · up to 4MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={onInputChange}
          aria-label="Upload house photos"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-stamp-700">
          {error}
        </p>
      ) : null}

      {required && photos.length === 0 ? (
        <p className="text-xs text-navy-400">At least one photo is required to submit.</p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((src, index) => (
            <li
              key={`${index}-${src.slice(0, 32)}`}
              className="group relative overflow-hidden rounded-xl border border-line bg-line"
            >
              <div className="relative aspect-[4/3]">
                {/* data URLs + remote demos */}
                {src.startsWith("data:") || src.startsWith("blob:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Image src={src} alt="" fill className="object-cover" sizes="200px" />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <GripVertical className="h-3 w-3 opacity-70" aria-hidden />
                  {index === 0 ? "Cover" : `Photo ${index + 1}`}
                </span>
                <div className="flex gap-1">
                  {index !== 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 border-white/30 bg-white/90 px-2 text-[10px]"
                      onClick={(event) => {
                        event.stopPropagation();
                        makeCover(index);
                      }}
                    >
                      Cover
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 border-white/30 bg-white/90 px-2"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeAt(index);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
