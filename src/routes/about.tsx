import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Landmark, Leaf, LifeBuoy, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Stats } from "@/components/site/Stats";
import { CTA } from "@/components/site/CTA";
import deck from "@/assets/deck-sunset.jpg";
import canal from "@/assets/M.V._ALASKA_AboutPageImage.jpeg";
import shipVideo from "@/assets/MvalaskaVideo.mp4";
import videoPoster from "@/assets/canal-mangrove.jpg";

/* ── Our Journey timeline ── */
const milestones = [
  {
    year: "2019",
    title: "A ship is imagined",
    body: "Designed from the keel up as a floating boutique hotel — not a converted ferry — with balconies on every suite.",
  },
  {
    year: "2020",
    title: "Maiden voyage",
    body: "Fully government-licensed, M.V. Alaska enters the Sundarbans for her first season with the Forest Department's blessing.",
  },
  {
    year: "2022",
    title: "The standard rises",
    body: "Sky-deck pool, conference suite and two restaurants complete the vision of a true expedition vessel.",
  },
  {
    year: "2025",
    title: "Connected in the wild",
    body: "Starlink satellite internet comes aboard — high-speed Wi-Fi from the deepest mangrove canals.",
  },
  {
    year: "Today",
    title: "35,000 guests and counting",
    body: "Six seasons on the river, and the same measure of success: every guest leaves already planning a return.",
  },
];

/* ── The ship in numbers ── */
const shipNumbers = [
  { value: "3", label: "Full Decks", desc: "Cabins, dining, open sky lounge" },
  { value: "31", label: "Balcony Suites", desc: "Every suite river-facing" },
  { value: "2", label: "Restaurants", desc: "Plus BBQ nights on deck" },
  { value: "1", label: "Sky-Deck Pool", desc: "Swim above the river" },
  { value: "1", label: "Conference Suite", desc: "Corporate retreats & events" },
  { value: "24/7", label: "Starlink Wi-Fi", desc: "Online in the deep forest" },
];

/* ── Trust & certification strip ── */
const trustItems = [
  {
    icon: Landmark,
    title: "Government Licensed",
    desc: "Fully approved for Sundarbans expedition cruising.",
  },
  {
    icon: Leaf,
    title: "Forest Department Partner",
    desc: "Operating hand in hand with conservation authorities.",
  },
  {
    icon: ShieldCheck,
    title: "Armed Forest Guards",
    desc: "Trained, licensed escorts on every shore excursion.",
  },
  {
    icon: LifeBuoy,
    title: "Safety First",
    desc: "Certified crew, life vests and drills on every voyage.",
  },
];

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About MV Alaska — Bangladesh's Most Luxurious Cruise" },
      { name: "description", content: "The story behind MV Alaska — the largest government-approved luxury cruise ship operating in the Sundarbans." },
    ],
  }),
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="The Brand"
        title={<>A floating <em className="not-italic">five-star</em> sanctuary.</>}
        subtitle="MV Alaska was conceived as Bangladesh's answer to the world's great river expedition vessels — uncompromising in comfort, devoted to the wild."
        image={deck}
      />

      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Our Philosophy"
              title={<>Deep wilderness. <em className="not-italic">Deep comfort.</em><br />One deck.</>}
              description="The conviction that has steered M.V. Alaska since her first voyage: that the world's largest mangrove forest deserves to be seen properly — and that seeing it properly should never mean roughing it."
            />
          </div>
          <div className="lg:col-span-7 space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              Exploring the Sundarbans once demanded a compromise: the wilderness came at the cost of comfort, or comfort at the cost of the wild. M.V. Alaska was built to retire that choice. Thirty-one private balcony suites look directly over tiger country; master chefs turn the day's river catch into candlelit dinners on the open deck; and every departure sails with Bangladesh's most experienced naturalists and trained forest guards aboard.
            </p>
            <p>
              Six years on the river and more than 35,000 guests later, our measure of success is unchanged. We are fully government-licensed, benchmarked against the world's great expedition vessels, and proudly Bangladeshi. Couples and families, corporate retreats in our dedicated conference suite, full-ship private charters — whoever steps aboard, the standard never wavers.
            </p>
          </div>
        </div>
      </section>

      <Stats />

      {/* ── Our Journey ── */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Our Journey"
            title={<>Six seasons. <em className="not-italic">One rising standard.</em></>}
          />
          <div className="mt-16 max-w-3xl mx-auto">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="relative grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-6 pb-12 last:pb-0"
              >
                {/* rail */}
                {i < milestones.length - 1 && (
                  <span className="absolute left-[103px] md:left-[143px] top-3 bottom-0 w-px bg-border" aria-hidden />
                )}
                <div className="text-right">
                  <span className="font-display text-2xl text-gold-text">{m.year}</span>
                </div>
                <div className="relative pl-10">
                  <span className="absolute left-0 top-2 size-3 rounded-full bg-gold ring-4 ring-gold/20 -translate-x-1/2" aria-hidden />
                  <h3 className="font-display text-xl">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">{m.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The ship in numbers ── */}
      <section className="py-24 bg-secondary/40">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="The Vessel"
            title={<>The ship, <em className="not-italic">in numbers.</em></>}
          />
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-2xl overflow-hidden">
            {shipNumbers.map((n) => (
              <div key={n.label} className="bg-background p-8 text-center">
                <div className="font-display text-4xl text-gold-text">{n.value}</div>
                <div className="mt-2 text-sm font-medium">{n.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{n.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── See her underway ── */}
      <section className="py-16 md:py-20 gradient-ocean overflow-hidden">
        <div className="container-luxe">
          <div className="text-center">
            <SectionHeader
              align="center"
              light
              eyebrow="The Ship"
              title={<>See her <em className="not-italic">underway.</em></>}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9 }}
            className="mt-8 relative rounded-3xl overflow-hidden shadow-luxe ring-1 ring-white/10"
          >
            <video
              src={shipVideo}
              poster={videoPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full aspect-[24/9] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Trust & certifications ── */}
      <section className="py-24 bg-background">
        <div className="container-luxe">
          <div className="text-center eyebrow text-gold-text mb-12">Licensed · Partnered · Prepared</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
            {trustItems.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="bg-background p-8 text-center"
              >
                <span className="mx-auto size-12 rounded-xl bg-gold/15 grid place-items-center">
                  <t.icon className="size-5 text-ocean" />
                </span>
                <h3 className="mt-4 font-display text-lg">{t.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-36 gradient-ocean">
        <div className="container-luxe grid lg:grid-cols-2 gap-12 items-center">
          <img src={canal} alt="M.V. Alaska in the Sundarbans" className="rounded-2xl shadow-luxe aspect-[4/3] object-cover" />
          <div className="text-background">
            <SectionHeader
              light
              eyebrow="Our Mission"
              title={<>To make the wild <em className="not-italic">accessible</em> — without diminishing it.</>}
              description="Sustainable cruising practices, low-impact mooring, and a deep partnership with the Forest Department keep the Sundarbans wild for the next generation."
            />
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
