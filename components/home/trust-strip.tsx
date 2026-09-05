import {
  BadgeCheck,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

const items = [
  {
    icon: MapPin,
    title: "Cities that matter",
    body: "Lagos, Abuja, Jos, and campuses nationwide.",
  },
  {
    icon: ShieldCheck,
    title: "Reviewed listings",
    body: "Nothing goes live until HouseMe checks it.",
  },
  {
    icon: BadgeCheck,
    title: "No agent cut",
    body: "Landlords list direct. You talk rent with them.",
  },
  {
    icon: Phone,
    title: "Call or WhatsApp",
    body: "Numbers stay on the listing — arrange a visit yourself.",
  },
];

export function TrustStrip() {
  return (
    <section className="mt-12 bg-ink text-white md:mt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:py-14">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-stamp" aria-hidden />
            <div>
              <p className="font-display text-base font-semibold">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
