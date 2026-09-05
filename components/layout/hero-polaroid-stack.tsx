import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const POLAROIDS = [
  {
    href: "/listings/lekki-self-con",
    src: "/images/listings/lekki-1.jpg",
    alt: "Furnished self-contained living room",
    caption: "Lekki · Self-con",
    rotate: "-11deg",
  },
  {
    href: "/listings/gwarinpa-flat",
    src: "/images/listings/yaba-1.jpg",
    alt: "Two-bedroom flat interior",
    caption: "Abuja · Flat",
    rotate: "-2deg",
  },
  {
    href: "/listings/jos-unijos-room",
    src: "/images/hero/living-room.jpg",
    alt: "Bright room and parlour",
    caption: "Jos · Room",
    rotate: "10deg",
  },
] as const;

export function HeroPolaroidStack() {
  return (
    <div className="polaroid-stack relative mx-auto h-[22rem] w-full max-w-md lg:mx-0 lg:h-[26rem] lg:max-w-none">
      {POLAROIDS.map((photo, index) => (
        <Link
          key={photo.href}
          href={photo.href}
          className="polaroid-slot absolute"
          style={
            {
              "--i": index,
              "--rest-rotate": photo.rotate,
              animationDelay: `${120 + index * 130}ms`,
            } as CSSProperties
          }
        >
          <span className="polaroid-card block bg-white p-[9px] pb-9 shadow-[0_14px_28px_-8px_rgba(18,38,58,0.45)]">
            <span className="relative block aspect-[4/5] overflow-hidden bg-photocopy">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority
                unoptimized
                className="object-cover object-center"
                sizes="220px"
              />
            </span>
            <span className="mt-2 block text-center font-display text-[11px] font-semibold tracking-wide text-navy/70">
              {photo.caption}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
