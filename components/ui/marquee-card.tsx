import Image from "next/image";
import { Star } from "lucide-react";
import { LiquidCard, CardContent } from "@/components/ui/liquid-glass-card";
import { Marquee } from "@/components/ui/marquee";

const testimonials = [
  {
    name: "Adaeze O.",
    role: "NYSC, Abuja",
    content:
      "I found a self-con near my PPA in two days. The number was on the listing — no agent chasing me for a fee.",
    avatar: "/images/avatars/avatar-1.jpg",
    rating: 5,
  },
  {
    name: "Chinedu K.",
    role: "Landlord, Yaba",
    content:
      "I listed a room for Unilag students. HouseMe reviewed it, then tenants started calling WhatsApp directly.",
    avatar: "/images/avatars/avatar-2.jpg",
    rating: 5,
  },
  {
    name: "Fatima B.",
    role: "Intern, Lagos",
    content:
      "Clear photos, clear rent, and I knew it had been checked. That made relocating for the internship less stressful.",
    avatar: "/images/avatars/avatar-3.jpg",
    rating: 5,
  },
  {
    name: "Tunde A.",
    role: "Student, Ibadan",
    content:
      "Found a shared flat walking distance to campus. Verified badge gave me confidence before I called.",
    avatar: "/images/avatars/avatar-4.jpg",
    rating: 5,
  },
  {
    name: "Ngozi E.",
    role: "Landlord, Enugu",
    content:
      "No agent cut. Tenants see my number and WhatsApp me. The review step keeps junk listings off the board.",
    avatar: "/images/avatars/avatar-5.jpg",
    rating: 5,
  },
];

export function MarqueeCard() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent md:w-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent md:w-20"
        aria-hidden
      />
      <Marquee pauseOnHover speed="slow" className="[--gap:1rem] py-2">
        {testimonials.map((testimonial) => (
          <LiquidCard
            key={`${testimonial.name}-${testimonial.role}`}
            className="mx-0 h-full w-80 border-line bg-white/90"
          >
            <CardContent className="flex h-full flex-col p-5 py-0">
              <div className="mb-4 flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-display text-sm font-semibold text-ink">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-navy-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-navy-600">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex gap-1" aria-label={`${testimonial.rating} out of 5`}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-stamp text-stamp"
                    aria-hidden
                  />
                ))}
              </div>
            </CardContent>
          </LiquidCard>
        ))}
      </Marquee>
    </div>
  );
}

/** Alias for 21st.dev-style imports */
export const Component = MarqueeCard;
