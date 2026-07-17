import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTA } from "@/components/site/CTA";
import img106 from "@/assets/106.jpeg";
import img107 from "@/assets/107.jpeg";
import img110 from "@/assets/110.jpeg";

export const Route = createFileRoute("/dining")({
  component: Dining,
  head: () => ({
    meta: [
      { title: "Dining Experience — MV Alaska Cruise" },
      { name: "description", content: "BBQ deck nights, buffet halls, traditional Bengali seafood and chef-curated menus aboard MV Alaska." },
    ],
  }),
});

const menus = [
  { name: "Sunrise Buffet", time: "07:00 — 10:00", desc: "Continental, Bengali breakfast classics, fresh juices, espresso bar." },
  { name: "Deck Lunch", time: "13:00 — 15:00", desc: "Coastal salads, river fish curry, slow-braised meats, seasonal vegetables." },
  { name: "Sunset BBQ", time: "19:30 — 22:30", desc: "Live grill, prawn skewers, chargrilled seafood, candlelight, string lights." },
  { name: "Late Lounge", time: "22:30 — late", desc: "Dessert tasting, herbal teas, cocktails under the stars on the open deck." },
];

function Dining() {
  return (
    <>
      <PageHero
        eyebrow="The Table"
        title={<>Dinner under <em className="not-italic">a thousand</em> stars.</>}
        subtitle="Master-chef curated menus combining coastal Bengali tradition with international refinement."
        image={img110}
      />

      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <SectionHeader
              eyebrow="The Experience"
              title={<>From the river. <em className="not-italic">To your plate.</em></>}
              description="Our chefs source fresh catch and seasonal produce daily. Every meal is a slow ritual — set against the backdrop of the world's wildest delta."
            />
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-luxe">
              <img src={img107} alt="MV Alaska dining hall" className="image-zoom absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-border">
            {menus.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-background p-8"
              >
                <div className="eyebrow text-gold text-[10px]">{m.time}</div>
                <h3 className="mt-3 font-display text-2xl">{m.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 overflow-hidden">
        <img src={img106} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ocean/75" />
        <div className="container-luxe relative text-center text-background">
          <div className="eyebrow text-gold-soft mb-5">◆ Signature Night</div>
          <h2 className="font-display text-4xl md:text-6xl font-light">The BBQ Deck Experience</h2>
          <p className="mt-6 max-w-2xl mx-auto text-background/80 text-lg">
            Live charcoal grill, jumbo prawns, river fish, hand-cut steaks. Candlelight on every table. Stars overhead. The Sundarbans as soundtrack.
          </p>
        </div>
      </section>

      <CTA />
    </>
  );
}
