import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import deck from "@/assets/deck-sunset.jpg";
import cabin from "@/assets/cabin-luxury.jpg";
import canal from "@/assets/canal-mangrove.jpg";

export const packages = [
  {
    img: deck,
    name: "The Signature Voyage",
    tag: "Most loved",
    nights: "3 Days · 2 Nights",
    route: "Khulna → Kotka → Jamtola",
    price: "৳ 28,500",
    perks: ["Private balcony cabin", "All meals + BBQ night", "Forest trekking", "Naturalist guide"],
  },
  {
    img: cabin,
    name: "Couple's Escape",
    tag: "Romantic",
    nights: "3 Days · 2 Nights",
    route: "Khulna → Hiron Point → Dublar Char",
    price: "৳ 36,800",
    perks: ["Honeymoon suite", "Candlelit deck dinner", "Private canoe ride", "Spa treatment"],
  },
  {
    img: canal,
    name: "Full Ship Charter",
    tag: "Corporate · Family",
    nights: "Custom · 3–7 nights",
    route: "Bespoke route across Sundarbans",
    price: "On request",
    perks: ["Entire vessel privately", "Conference & event space", "Custom culinary menu", "Branded experience"],
  },
];

export function Packages() {
  return (
    <section className="relative py-28 md:py-40 bg-secondary/40">
      <div className="container-luxe">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <SectionHeader
            eyebrow="Curated Voyages"
            title={<>Three nights, <em className="not-italic text-gradient-gold">a thousand</em> memories.</>}
            description="Hand-crafted itineraries through the most cinematic corners of Sundarbans — Andharmanik, Kotka, Hiron Point, Dublar Char."
          />
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-ocean text-sm uppercase tracking-[0.18em] hover:text-gold transition-colors border-b border-ocean/30 hover:border-gold pb-1 self-start"
          >
            All packages <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((p, i) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-luxe hover-lift"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="image-zoom absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean/90 via-ocean/20 to-transparent" />
                <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full glass-dark text-gold eyebrow text-[10px]">
                  {p.tag}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <h3 className="font-display text-3xl text-background font-light leading-tight">{p.name}</h3>
                  <div className="mt-3 flex items-center gap-4 text-background/75 text-xs">
                    <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-gold" /> {p.nights}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <MapPin className="size-4 text-gold mt-0.5 shrink-0" /> {p.route}
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="size-1 rounded-full bg-gold" /> {perk}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border flex items-end justify-between">
                  <div>
                    <div className="eyebrow text-muted-foreground text-[10px]">From</div>
                    <div className="font-display text-2xl text-foreground">{p.price}</div>
                    <div className="text-[11px] text-muted-foreground">per person</div>
                  </div>
                  <Link
                    to="/booking"
                    className="px-4 py-2.5 rounded-full bg-ocean text-background text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-gold hover:text-ocean transition-colors"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
