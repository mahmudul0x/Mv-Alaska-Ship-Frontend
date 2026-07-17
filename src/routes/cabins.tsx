import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bed, Wifi, Wind, Refrigerator, Bath, Eye } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTA } from "@/components/site/CTA";
import { useCabins } from "@/hooks/queries/useCabins";
import { cabinPlaceholder } from "@/lib/cabinPlaceholder";
import img109 from "@/assets/109.jpeg";

export const Route = createFileRoute("/cabins")({
  component: Cabins,
  head: () => ({
    meta: [
      { title: "Luxury Cabins & Suites — MV Alaska Cruise" },
      { name: "description", content: "River-facing private balcony cabins, panorama suites, and honeymoon rooms aboard MV Alaska." },
    ],
  }),
});

const amenities = [
  { icon: Wifi, label: "Starlink Wi-Fi" },
  { icon: Wind, label: "Premium AC" },
  { icon: Bath, label: "En-suite bath" },
  { icon: Bed, label: "Egyptian linens" },
  { icon: Refrigerator, label: "Mini Fridge" },
  { icon: Eye, label: "Balcony view" },
];

function Cabins() {
  const { data: cabins, isLoading } = useCabins();

  return (
    <>
      <PageHero
        eyebrow="Cabins & Suites"
        title={<>Your private <em className="not-italic">river</em> sanctuary.</>}
        subtitle="Wood-clad interiors, floor-to-ceiling glass, and the Sundarbans as your view."
        image={img109}
      />

      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Accommodations"
            title={<>Every cabin. <em className="not-italic">One standard.</em></>}
            description="Every cabin features private en-suite, premium bedding, ambient lighting, and uninterrupted river views."
          />

          {isLoading ? (
            <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-luxe bg-card animate-pulse">
                  <div className="aspect-4/3 bg-muted" />
                  <div className="p-7 space-y-3">
                    <div className="h-6 w-2/3 bg-muted rounded" />
                    <div className="h-4 w-1/3 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-5/6 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
              {(cabins ?? []).map((c, i) => (
                <motion.article
                  key={c.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden shadow-luxe hover-lift"
                >
                  <Link to="/cabins/$slug" params={{ slug: c.slug }} className="block">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <img
                        src={c.main_image?.image ?? cabinPlaceholder}
                        alt={c.name}
                        loading="lazy"
                        className="image-zoom absolute inset-0 h-full w-full object-cover"
                      />
                      {c.size_label && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full glass-dark text-gold-soft eyebrow text-[10px]">{c.size_label}</div>
                      )}
                      <div className="absolute inset-0 bg-ocean/0 group-hover:bg-ocean/20 transition-colors duration-500 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-5 py-2.5 rounded-full glass text-background text-[10px] uppercase tracking-[0.2em] font-semibold">
                          View Details
                        </span>
                      </div>
                    </div>
                    <div className="p-7">
                      <h3 className="font-display text-2xl font-normal group-hover:text-gold-text transition-colors">{c.name}</h3>
                      {c.occupancy && (
                        <div className="mt-1 text-sm text-muted-foreground">{c.occupancy}</div>
                      )}
                      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                        {c.features.slice(0, 4).map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="size-1 rounded-full bg-gold shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 pt-5 border-t border-border flex items-center justify-end">
                        <span className="px-5 py-2.5 rounded-full bg-ocean text-background text-[10px] uppercase tracking-[0.2em] font-semibold group-hover:bg-gold group-hover:text-ocean transition-colors">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-secondary/40">
        <div className="container-luxe">
          <div className="text-center eyebrow text-gold-text mb-10">In every cabin</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-border rounded-2xl overflow-hidden">
            {amenities.map((a) => (
              <div key={a.label} className="bg-background p-8 text-center">
                <a.icon className="size-7 text-gold mx-auto stroke-[1.2]" />
                <div className="mt-3 text-sm">{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
