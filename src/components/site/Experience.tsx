import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import deck from "@/assets/deck-sunset.jpg";
import cabin from "@/assets/cabin-luxury.jpg";
import dining from "@/assets/dining-bbq.jpg";
import canal from "@/assets/canal-mangrove.jpg";

const experiences = [
  {
    img: cabin,
    eyebrow: "01 — Sanctuary",
    title: "Private Balcony Suites",
    desc: "Wake to mist over the river from your own glass-walled terrace.",
    href: "/cabins",
    span: "lg:col-span-7 lg:row-span-2",
  },
  {
    img: deck,
    eyebrow: "02 — Horizon",
    title: "Open Sky Deck & Pool",
    desc: "Sunset cocktails above the canopy.",
    href: "/cruise-experience",
    span: "lg:col-span-5",
  },
  {
    img: dining,
    eyebrow: "03 — Indulge",
    title: "BBQ Nights Under Stars",
    desc: "Live grill, ocean catch, and string-light dinners on deck.",
    href: "/dining",
    span: "lg:col-span-5",
  },
  {
    img: canal,
    eyebrow: "04 — Wild",
    title: "Hidden Mangrove Canals",
    desc: "Glide through corridors only Alaska can navigate.",
    href: "/wildlife",
    span: "lg:col-span-12",
  },
];

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative py-28 md:py-40 gradient-ocean overflow-hidden">
      <motion.div
        style={{ y: yBg }}
        className="absolute -top-40 -right-40 size-[600px] rounded-full bg-gold/5 blur-3xl"
      />
      <div className="container-luxe relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <SectionHeader
            light
            eyebrow="The Experience"
            title={<>A floating five-star <em className="not-italic text-gradient-gold">private world</em>.</>}
            description="Every corner of MV Alaska is designed for slow, sensory immersion — from the wood-clad cabins to the open sky lounge."
          />
          <Link
            to="/cruise-experience"
            className="inline-flex items-center gap-2 text-gold text-sm uppercase tracking-[0.18em] hover:text-gold-soft transition-colors"
          >
            View ship tour <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-[280px] md:auto-rows-[340px]">
          {experiences.map((e, i) => (
            <motion.div
              key={e.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl ${e.span ?? ""}`}
            >
              <Link to={e.href} className="absolute inset-0 z-10" aria-label={e.title} />
              <img
                src={e.img}
                alt={e.title}
                loading="lazy"
                className="image-zoom absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean via-ocean/40 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
              <div className="relative h-full flex flex-col justify-end p-7 md:p-8">
                <div className="eyebrow text-gold-soft mb-3">{e.eyebrow}</div>
                <h3 className="font-display text-2xl md:text-4xl text-background font-light leading-tight max-w-md">
                  {e.title}
                </h3>
                <p className="mt-2 text-background/70 text-sm max-w-md">{e.desc}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Discover <ArrowUpRight className="size-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
