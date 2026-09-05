"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/images/hero/living-room.jpg";

export function AnimatedHero({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["verified", "agent-free", "affordable", "reviewed", "nationwide"],
    [],
  );

  useEffect(() => {
    if (reduceMotion) return;
    const timeoutId = setTimeout(() => {
      setTitleNumber((current) => (current === titles.length - 1 ? 0 : current + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles, reduceMotion]);

  return (
    <section
      id="site-hero"
      className={cn(
        "relative isolate min-h-[88svh] w-full overflow-hidden bg-black text-white",
        className,
      )}
    >
      <div className="absolute inset-0 min-h-[88svh]" aria-hidden="true">
        <div
          className={cn(
            "hero-photo-layer absolute inset-0 min-h-[88svh] will-change-transform",
            !reduceMotion &&
              "motion-safe:animate-[hero-kenburns_24s_ease-in-out_infinite_alternate]",
          )}
        >
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="hero-photo-veil absolute inset-0 min-h-[88svh]" />
      </div>

      <div className="site-shell relative z-10">
        <div className="flex min-h-[88svh] flex-col items-center justify-center gap-7 pb-28 pt-28 text-center md:pb-32">
          <div className="hero-enter hero-enter-headline flex max-w-3xl flex-col gap-5">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-white md:text-6xl lg:text-[4.25rem] lg:leading-[1.05]">
              <span className="block">Housing that&apos;s</span>
              <span className="relative mt-1 flex h-[1.15em] w-full items-center justify-center overflow-hidden md:mt-2">
                {reduceMotion ? (
                  <span className="font-semibold text-stamp">{titles[0]}</span>
                ) : (
                  titles.map((title, index) => (
                    <motion.span
                      key={title}
                      className="absolute font-semibold text-stamp"
                      initial={{ opacity: 0, y: 40 }}
                      transition={{ type: "spring", stiffness: 60, damping: 16 }}
                      animate={
                        titleNumber === index
                          ? { y: 0, opacity: 1 }
                          : {
                              y: titleNumber > index ? -56 : 56,
                              opacity: 0,
                            }
                      }
                    >
                      {title}
                    </motion.span>
                  ))
                )}
              </span>
            </h1>

            <p className="hero-enter-sub mx-auto max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              Verified rooms and flats for students, NYSC corps members, and
              interns relocating across Nigeria — without the agent fee.
            </p>
          </div>

          <div className="hero-enter-card">
            <Button asChild size="lg" variant="stamp" className="gap-2">
              <Link href="/search">
                Explore listings
                <MoveRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export { AnimatedHero as Hero };
