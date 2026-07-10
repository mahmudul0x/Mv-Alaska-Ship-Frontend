import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Bed, Wifi, Wind, Coffee, Bath, Eye,
  Users, Maximize2, ChevronLeft, ChevronRight, ArrowLeft,
} from "lucide-react";
import { CTA } from "@/components/site/CTA";
import { cabins } from "@/data/cabins";
import { useRoomTypes } from "@/hooks/queries/useRoomTypes";
import { formatBDT } from "@/lib/money";

export const Route = createFileRoute("/cabins/$slug")({
  loader: ({ params }) => {
    const cabin = cabins.find((c) => c.slug === params.slug);
    if (!cabin) throw notFound();
    return cabin;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.name} — MV Alaska Cruise` },
      { name: "description", content: loaderData.tagline },
    ],
  }),
  component: CabinDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <h1 className="font-display text-4xl">Cabin not found</h1>
      <Link to="/cabins" className="px-6 py-3 rounded-full bg-ocean text-background text-sm uppercase tracking-widest">
        Back to cabins
      </Link>
    </div>
  ),
});

const amenityIcons = [Bed, Wifi, Wind, Coffee, Bath, Eye, Users, Maximize2];

function CabinDetail() {
  const cabin = Route.useLoaderData();
  const [imgIdx, setImgIdx] = useState(0);
  const { data: roomTypes } = useRoomTypes();
  const roomType = roomTypes?.find((rt) => rt.name === cabin.roomTypeName);
  const occupancy = roomType
    ? `${roomType.max_adults} Adults${roomType.max_kids ? ` + ${roomType.max_kids} Kids` : ""}`
    : cabin.occupancy;
  const price = roomType ? formatBDT(roomType.base_price) : cabin.price;

  const go = (dir: number) =>
    setImgIdx((i) => (i + dir + cabin.gallery.length) % cabin.gallery.length);

  return (
    <>
      {/* ── Hero image with overlay ── */}
      <section className="relative h-[80svh] min-h-[560px] overflow-hidden bg-ocean">
        <AnimatePresence mode="sync">
          <motion.img
            key={imgIdx}
            src={cabin.gallery[imgIdx]}
            alt={cabin.name}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ocean via-ocean/50 to-ocean/20" />

        {/* Gallery nav */}
        {cabin.gallery.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full glass text-background hover:text-gold grid place-items-center transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full glass text-background hover:text-gold grid place-items-center transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {cabin.gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === imgIdx ? "w-8 bg-gold" : "w-2 bg-background/50"}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Back link */}
        <Link
          to="/cabins"
          className="absolute top-28 left-6 z-20 flex items-center gap-2 text-background/80 hover:text-gold text-sm transition-colors"
        >
          <ArrowLeft className="size-4" /> All Cabins
        </Link>

        {/* Title block */}
        <div className="relative z-10 h-full container-luxe flex flex-col justify-end pb-16 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="eyebrow text-gold-soft mb-4"
          >
            ◆ Cabins & Suites
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="font-display text-background text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95]"
          >
            {cabin.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-5 max-w-xl text-background/75 text-lg"
          >
            {cabin.tagline}
          </motion.p>
        </div>
      </section>

      {/* ── Quick stats bar ── */}
      <div className="bg-ocean border-b border-white/10">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[
            { label: "Size", value: cabin.size },
            { label: "Occupancy", value: occupancy },
            { label: "Base price", value: price },
            { label: "Meals", value: "All inclusive" },
          ].map((s) => (
            <div key={s.label} className="px-6 py-5 text-center">
              <div className="eyebrow text-gold-soft text-[10px]">{s.label}</div>
              <div className="mt-1 font-display text-xl text-background">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-16">

          {/* Left — description + highlights */}
          <div className="lg:col-span-7 space-y-14">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="eyebrow text-gold mb-4">About this cabin</div>
              <p className="text-foreground/80 text-lg leading-relaxed">{cabin.description}</p>
            </motion.div>

            {/* Features list */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="eyebrow text-gold mb-6">What's included</div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {cabin.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-1.5 size-1.5 rounded-full bg-gold shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="eyebrow text-gold mb-6">Highlights</div>
              <div className="grid gap-px bg-border rounded-2xl overflow-hidden">
                {cabin.highlights.map((h, i) => (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="bg-background p-6 hover:bg-secondary/40 transition-colors"
                  >
                    <h3 className="font-display text-xl">{h.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Gallery thumbnails */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="eyebrow text-gold mb-6">Gallery</div>
              <div className="grid grid-cols-3 gap-3">
                {cabin.gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => { setImgIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`relative aspect-4/3 rounded-xl overflow-hidden ring-2 transition-all ${i === imgIdx ? "ring-gold" : "ring-transparent hover:ring-gold/50"}`}
                  >
                    <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — amenities + booking card */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 lg:self-start">

            {/* Booking card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={cabin.img} alt={cabin.name} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean/80 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <div className="eyebrow text-gold-soft text-[10px]">Starting from</div>
                  <div className="font-display text-3xl text-background">{price}</div>
                  <div className="text-xs text-background/60 mt-0.5">{cabin.priceNote}</div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/booking"
                  className="block w-full py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold text-center shadow-gold hover-lift"
                >
                  Reserve This Cabin
                </Link>
                {/* Room type is a booking-time preference hint only — actual
                    room availability is package-specific (Phase 3). */}
                <Link
                  to="/contact"
                  className="block w-full py-4 rounded-full border border-ocean text-ocean text-xs uppercase tracking-[0.2em] font-semibold text-center hover:bg-ocean hover:text-background transition-colors"
                >
                  Ask a Question
                </Link>
              </div>
            </motion.div>

            {/* Amenities grid */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <div className="eyebrow text-gold text-[10px]">Cabin specs</div>
              </div>
              <div className="divide-y divide-border">
                {cabin.amenities.map((a, i) => (
                  <div key={a.label} className="flex items-center justify-between px-6 py-3.5 text-sm">
                    <span className="text-muted-foreground">{a.label}</span>
                    <span className="font-medium text-foreground">{a.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Other cabins */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="eyebrow text-gold mb-4">Other cabins</div>
              <div className="space-y-3">
                {cabins.filter((c) => c.slug !== cabin.slug).map((c) => (
                  <Link
                    key={c.slug}
                    to="/cabins/$slug"
                    params={{ slug: c.slug }}
                    className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-gold/50 hover:bg-secondary/40 transition-all group"
                  >
                    <img src={c.img} alt={c.name} className="size-16 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-display text-base group-hover:text-gold transition-colors truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.size} · {c.occupancy}</div>
                      <div className="text-xs text-gold mt-0.5">{c.price} / night</div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
