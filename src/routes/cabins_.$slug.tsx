import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { CTA } from "@/components/site/CTA";
import { useCabin, useCabins } from "@/hooks/queries/useCabins";
import { cabinPlaceholder } from "@/lib/cabinPlaceholder";

export const Route = createFileRoute("/cabins_/$slug")({
  component: CabinDetail,
});

function CabinNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <h1 className="font-display text-4xl">Cabin not found</h1>
      <Link to="/cabins" className="px-6 py-3 rounded-full bg-ocean text-background text-sm uppercase tracking-widest">
        Back to cabins
      </Link>
    </div>
  );
}

function CabinLoading() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <div className="eyebrow text-muted-foreground">Loading cabin…</div>
      </div>
    </div>
  );
}

function CabinDetail() {
  const { slug } = Route.useParams();
  const { data: cabin, isLoading, isError } = useCabin(slug);
  const { data: allCabins } = useCabins();
  const [imgIdx, setImgIdx] = useState(0);

  if (isLoading) return <CabinLoading />;
  if (isError || !cabin) return <CabinNotFound />;

  const gallery = cabin.images.length
    ? cabin.images.map((img) => img.image)
    : [cabinPlaceholder];
  const safeIdx = Math.min(imgIdx, gallery.length - 1);
  const mainImage = cabin.main_image?.image ?? gallery[0];
  const otherCabins = (allCabins ?? []).filter((c) => c.slug !== cabin.slug);

  const go = (dir: number) =>
    setImgIdx((i) => (i + dir + gallery.length) % gallery.length);

  return (
    <>
      {/* ── Hero image with overlay ── */}
      <section className="relative h-[80svh] min-h-[560px] overflow-hidden bg-ocean">
        <AnimatePresence mode="sync">
          <motion.img
            key={safeIdx}
            src={gallery[safeIdx]}
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
        {gallery.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full glass text-background hover:text-gold grid place-items-center transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full glass text-background hover:text-gold grid place-items-center transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setImgIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === safeIdx ? "w-8 bg-gold" : "w-2 bg-background/50"}`}
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
          {cabin.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-5 max-w-xl text-background/75 text-lg"
            >
              {cabin.tagline}
            </motion.p>
          )}
        </div>
      </section>

      {/* ── Quick stats bar ── */}
      <div className="bg-ocean border-b border-white/10">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[
            { label: "Size", value: cabin.size_label || "—" },
            { label: "Occupancy", value: cabin.occupancy || "—" },
            { label: "Meals", value: "All inclusive" },
            { label: "Internet", value: "Starlink Wi-Fi" },
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
            {cabin.description && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="eyebrow text-gold-text mb-4">About this cabin</div>
                <p className="text-foreground/80 text-lg leading-relaxed">{cabin.description}</p>
              </motion.div>
            )}

            {/* Features list */}
            {cabin.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <div className="eyebrow text-gold-text mb-6">What's included</div>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {cabin.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                      <span className="mt-1.5 size-1.5 rounded-full bg-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Highlights */}
            {cabin.highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                <div className="eyebrow text-gold-text mb-6">Highlights</div>
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
            )}

            {/* Gallery thumbnails */}
            {cabin.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="eyebrow text-gold-text mb-6">Gallery</div>
                <div className="grid grid-cols-3 gap-3">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => { setImgIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden ring-2 transition-all ${i === safeIdx ? "ring-gold" : "ring-transparent hover:ring-gold/50"}`}
                    >
                      <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right — booking card + specs */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 lg:self-start">

            {/* Booking card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={mainImage} alt={cabin.name} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean/80 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <div className="eyebrow text-gold-soft text-[10px]">Reserve</div>
                  <div className="font-display text-2xl text-background">{cabin.name}</div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/booking"
                  className="block w-full py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold text-center shadow-luxe hover-lift"
                >
                  Reserve This Cabin
                </Link>
                <Link
                  to="/contact"
                  className="block w-full py-4 rounded-full border border-ocean text-ocean text-xs uppercase tracking-[0.2em] font-semibold text-center hover:bg-ocean hover:text-background transition-colors"
                >
                  Ask a Question
                </Link>
              </div>
            </motion.div>

            {/* Amenities grid */}
            {cabin.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="px-6 pt-6 pb-4 border-b border-border">
                  <div className="eyebrow text-gold-text text-[10px]">Cabin specs</div>
                </div>
                <div className="divide-y divide-border">
                  {cabin.amenities.map((a) => (
                    <div key={a.label} className="flex items-center justify-between px-6 py-3.5 text-sm">
                      <span className="text-muted-foreground">{a.label}</span>
                      <span className="font-medium text-foreground">{a.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Other cabins */}
            {otherCabins.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="eyebrow text-gold-text mb-4">Other cabins</div>
                <div className="space-y-3">
                  {otherCabins.map((c) => (
                    <Link
                      key={c.slug}
                      to="/cabins/$slug"
                      params={{ slug: c.slug }}
                      onClick={() => setImgIdx(0)}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-gold/50 hover:bg-secondary/40 transition-all group"
                    >
                      <img
                        src={c.main_image?.image ?? cabinPlaceholder}
                        alt={c.name}
                        className="size-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-display text-base group-hover:text-gold-text transition-colors truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {[c.size_label, c.occupancy].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <CTA />

      {/* Room for the sticky bar so it never hides the last content on mobile */}
      <div className="h-20 lg:hidden" aria-hidden />

      {/* Mobile sticky reserve bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-card/95 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm truncate">{cabin.name}</div>
          {cabin.occupancy && (
            <div className="text-[10px] text-muted-foreground truncate">{cabin.occupancy}</div>
          )}
        </div>
        <Link
          to="/booking"
          className="shrink-0 px-6 py-3 rounded-full gradient-gold text-ocean text-[10px] uppercase tracking-[0.18em] font-semibold shadow-luxe"
        >
          Reserve
        </Link>
      </div>
    </>
  );
}
