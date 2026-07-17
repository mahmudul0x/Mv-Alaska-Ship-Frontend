import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Landmark,
  Globe,
  PawPrint,
  Bird,
  Sunrise,
  Waves,
  Sun,
  Binoculars,
  Telescope,
  ShieldCheck,
  Leaf,
  MapPin,
  Clock,
} from "lucide-react";
import { Wildlife } from "@/components/site/Wildlife";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTA } from "@/components/site/CTA";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import tiger from "@/assets/wildlife-tiger.jpg";
import imgTiger from "@/assets/wildlife/Royal Bengal Tiger.jpeg";
import imgDeer from "@/assets/wildlife/Spotted Deer.jpeg";
import imgMacaque from "@/assets/wildlife/Rhesus Macaque.jpeg";
import imgCrocodile from "@/assets/wildlife/Saltwater Crocodile.jpeg";
import imgDolphin from "@/assets/wildlife/Irrawaddy Dolphin.jpeg";
import imgKingfisher from "@/assets/wildlife/Kingfishers.jpeg";
import imgSeaEagle from "@/assets/wildlife/White-bellied Sea Eagle.jpeg";
import imgMonitor from "@/assets/wildlife/Water Monitor Lizard.jpeg";

export const Route = createFileRoute("/wildlife")({
  component: WildlifePage,
  head: () => ({
    meta: [
      { title: "Wildlife Experience — MV Alaska Sundarbans" },
      { name: "description", content: "Royal Bengal tigers, spotted deer, kingfishers and the world's largest mangrove ecosystem — experienced from a luxury cruise." },
    ],
  }),
});

/* ------------------------------ Conservation ------------------------------ */

const conservationFacts = [
  { icon: Landmark, value: "1997", label: "UNESCO World Heritage", desc: "Protected as a natural World Heritage Site" },
  { icon: Globe, value: "10,000 km²", label: "Largest Mangrove on Earth", desc: "A single forest shared by Bangladesh & India" },
  { icon: PawPrint, value: "125", label: "Royal Bengal Tigers", desc: "2024 census, Bangladesh Sundarbans" },
  { icon: Bird, value: "300+", label: "Bird Species", desc: "Residents, raptors and winter migrants" },
];

/* ------------------------------ Species guide ----------------------------- */

type Chance = "Very Common" | "Common" | "Frequent" | "Very Rare";

// Solid fills: these badges sit on top of busy foliage photos, where the old
// 10–15% tinted backgrounds were unreadable.
const chanceStyle: Record<Chance, string> = {
  "Very Common": "bg-mangrove text-white",
  Common: "bg-ocean text-white",
  Frequent: "bg-gold text-ocean",
  "Very Rare": "bg-destructive text-white",
};

// Species photos: import the image above and set it on the `img` field below.
// Cards without an `img` render an elegant placeholder until the photo arrives.
const species: {
  name: string;
  bangla: string;
  desc: string;
  chance: Chance;
  where: string;
  when: string;
  img?: string;
}[] = [
  {
    name: "Royal Bengal Tiger",
    bangla: "রয়েল বেঙ্গল টাইগার",
    desc: "The only tiger on earth that rules a mangrove. Most guests meet it through fresh pugmarks and alarm calls — a sighting is the forest's rarest gift.",
    chance: "Very Rare",
    where: "Kotka meadows",
    when: "Dawn & dusk",
    img: imgTiger,
  },
  {
    name: "Spotted Deer",
    bangla: "চিত্রা হরিণ",
    desc: "Elegant herds drift through the keora groves in their hundreds. The signature sight of every Sundarbans voyage.",
    chance: "Very Common",
    where: "Karamjal & Kotka",
    when: "All day",
    img: imgDeer,
  },
  {
    name: "Rhesus Macaque",
    bangla: "বানর",
    desc: "Curious troops patrol the canopy boardwalks and riverbanks, often foraging side by side with the deer below.",
    chance: "Very Common",
    where: "Karamjal boardwalk",
    when: "Morning",
    img: imgMacaque,
  },
  {
    name: "Saltwater Crocodile",
    bangla: "লোনা পানির কুমির",
    desc: "The estuary's ancient apex reptile, seen basking motionless on sun-warmed mudflats as the tide falls.",
    chance: "Frequent",
    where: "Mudflats & creeks",
    when: "Low tide, midday",
    img: imgCrocodile,
  },
  {
    name: "Irrawaddy Dolphin",
    bangla: "ইরাবতী ডলফিন",
    desc: "Shy, round-headed river dolphins that surface quietly beside the ship in the wider channels of the Pasur.",
    chance: "Frequent",
    where: "Pasur river channels",
    when: "Early morning",
    img: imgDolphin,
  },
  {
    name: "Kingfishers",
    bangla: "মাছরাঙা — ৯টি প্রজাতি",
    desc: "Nine jewel-coloured species flash along the narrow canals — brown-winged, collared, black-capped and more.",
    chance: "Very Common",
    where: "Andharmanik canals",
    when: "Golden hour",
    img: imgKingfisher,
  },
  {
    name: "White-bellied Sea Eagle",
    bangla: "সাদা-বুক সিন্ধু ঈগল",
    desc: "A two-metre wingspan patrolling the big rivers, plucking fish from the surface in slow, cinematic dives.",
    chance: "Common",
    where: "Open river",
    when: "All day",
    img: imgSeaEagle,
  },
  {
    name: "Water Monitor Lizard",
    bangla: "গুইসাপ",
    desc: "Dragon-like giants up to two metres long, swimming the creeks and sunning on exposed roots and banks.",
    chance: "Common",
    where: "Creek banks",
    when: "Low tide",
    img: imgMonitor,
  },
];

/* --------------------------- Season & timing data -------------------------- */

type SeasonQuality = "peak" | "good" | "fair" | "green";

const months: { m: string; q: SeasonQuality }[] = [
  { m: "Jan", q: "peak" },
  { m: "Feb", q: "peak" },
  { m: "Mar", q: "good" },
  { m: "Apr", q: "fair" },
  { m: "May", q: "fair" },
  { m: "Jun", q: "green" },
  { m: "Jul", q: "green" },
  { m: "Aug", q: "green" },
  { m: "Sep", q: "green" },
  { m: "Oct", q: "good" },
  { m: "Nov", q: "peak" },
  { m: "Dec", q: "peak" },
];

const seasonStyle: Record<SeasonQuality, { bar: string; label: string }> = {
  peak: { bar: "bg-gold h-16", label: "Peak season" },
  good: { bar: "bg-mangrove/70 h-12", label: "Very good" },
  fair: { bar: "bg-ocean/40 h-8", label: "Quiet forest" },
  green: { bar: "bg-mangrove/30 h-6", label: "Green monsoon" },
};

const goldenMoments = [
  {
    icon: Sunrise,
    title: "First Light",
    body: "Deer step onto the banks and last night's tiger tracks are still sharp in the mud. The forest is loudest before breakfast.",
  },
  {
    icon: Waves,
    title: "Low Tide",
    body: "Falling water exposes the mudflats — crocodiles bask, monitor lizards hunt, and every paw print of the night is revealed.",
  },
  {
    icon: Sun,
    title: "Golden Hour",
    body: "Kingfishers and sea eagles hunt in the warm side-light — the photographer's window, straight from the wildlife deck.",
  },
];

/* ------------------------------ Guides & safety ---------------------------- */

const fieldcraft = [
  {
    icon: Binoculars,
    title: "Expert Naturalists",
    desc: "Guides who have spent decades reading the forest — tide, track and alarm call — narrate every mile of the voyage.",
  },
  {
    icon: Telescope,
    title: "Telescopes & Photo Blinds",
    desc: "The dedicated wildlife deck carries spotting scopes, loaner binoculars and shaded blinds for long-lens photography.",
  },
  {
    icon: ShieldCheck,
    title: "Armed Forest Guards",
    desc: "Every shore excursion is escorted by trained, government-licensed forest guards — adventurous, never reckless.",
  },
  {
    icon: Leaf,
    title: "Silent-Ship Ethics",
    desc: "Engines idle in wildlife zones, distances are respected and nothing is baited or fed. The forest sets the terms.",
  },
];

/* ---------------------------------- FAQ ----------------------------------- */

const faqs = [
  {
    q: "Will I actually see a Royal Bengal Tiger?",
    a: "We are honest about this: a tiger sighting is rare — the Sundarbans tiger is famously secretive, and dense mangrove is the hardest terrain on earth to spot one in. What you will almost certainly experience is its presence: fresh pugmarks on the mud, deer alarm calls, and the naturalists' tracking briefings at Kotka. When a sighting does happen, it becomes the story of a lifetime — but we never promise one.",
  },
  {
    q: "What wildlife am I almost guaranteed to see?",
    a: "Spotted deer in the hundreds, rhesus macaques, kingfishers of several species, sea eagles and other raptors, and monitor lizards. Saltwater crocodiles and Irrawaddy dolphins are seen on most voyages, tide and weather permitting.",
  },
  {
    q: "When is the best time of year to cruise?",
    a: "November to February is peak season — cool, dry weather, calm water, the best visibility and the winter migratory birds. October and March are excellent shoulder months. The monsoon (June–September) turns the forest a spectacular green but sightings are fewer and excursions weather-dependent.",
  },
  {
    q: "Do I need to bring binoculars or camera gear?",
    a: "The wildlife deck carries spotting scopes and loaner binoculars, so you can travel light. Photographers should bring their longest lens — 300mm or more is ideal — plus rain protection for gear during canal excursions.",
  },
  {
    q: "How safe are the shore excursions?",
    a: "Every landing follows Forest Department protocols: licensed armed forest guards escort each group, naturalists carry radios, life jackets are mandatory on tenders, and routes are chosen by tide and recent track activity. No guest walks the forest unescorted.",
  },
  {
    q: "Is the experience suitable for children?",
    a: "Yes — families cruise with us year-round. Karamjal's boardwalk and the deer meadows are wonderful for kids, child-size life jackets are provided, and our crew keeps excursion pacing family-friendly. We recommend the trip for children old enough to stay quiet during wildlife approaches.",
  },
];

/* ---------------------------------- Page ----------------------------------- */

function WildlifePage() {
  return (
    <>
      <PageHero
        eyebrow="The Wild"
        title={<>The <em className="not-italic">last great</em> mangrove on earth.</>}
        subtitle="Documentary-grade encounters with tigers, deer, crocodiles, and 300+ bird species — guided by Bangladesh's most experienced naturalists."
        image={tiger}
      />

      <Wildlife />

      {/* Conservation facts */}
      <section className="relative py-20 md:py-24 bg-secondary/40 overflow-hidden">
        <div className="absolute top-0 inset-x-0 gold-rule opacity-40" />
        <div className="container-luxe">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-luxe">
            {conservationFacts.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-background p-8 md:p-10 text-center"
              >
                <f.icon className="size-6 text-gold mx-auto stroke-[1.4]" />
                <div className="mt-4 font-display text-3xl md:text-4xl font-light">{f.value}</div>
                <div className="mt-2 eyebrow text-ocean/80 text-[0.65rem]">{f.label}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Species guide */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Field Guide"
            title={<>Who you'll <em className="not-italic">meet</em> out there.</>}
            description="Every resident of the delta, with an honest read on how likely you are to see them — as briefed by our naturalists on night one."
          />

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {species.map((s, i) => (
              <motion.article
                key={s.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-luxe hover-lift flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  {s.img ? (
                    <img
                      src={s.img}
                      alt={s.name}
                      loading="lazy"
                      className="image-zoom absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-mangrove/15 via-secondary to-ocean/10 grid place-items-center">
                      <PawPrint className="size-10 text-gold/30 stroke-[1.2]" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold ${chanceStyle[s.chance]} ${s.img ? "backdrop-blur-sm" : ""}`}>
                    {s.chance}
                  </span>
                  <span className="absolute bottom-3 left-3 font-display text-lg font-light text-background/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display text-2xl font-normal leading-tight group-hover:text-gold-text transition-colors">
                    {s.name}
                  </h3>
                  <div className="mt-1 text-sm text-muted-foreground">{s.bangla}</div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
                  <div className="mt-5 pt-4 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-gold shrink-0" /> {s.where}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-gold shrink-0" /> {s.when}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Season calendar & golden moments */}
      <section className="py-28 md:py-36 bg-secondary/40">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="When to Sail"
            title={<>The forest keeps a <em className="not-italic">calendar</em>.</>}
            description="November to February brings cool air, calm water and the winter migrants. The monsoon paints everything green — and keeps its secrets."
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-16 bg-background rounded-2xl shadow-luxe p-8 md:p-10"
          >
            <div className="grid grid-cols-12 gap-2 md:gap-3 items-end">
              {months.map((mo) => (
                <div key={mo.m} className="flex flex-col items-center gap-2">
                  <div className={`w-full rounded-t-md transition-all ${seasonStyle[mo.q].bar}`} />
                  <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{mo.m}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-gold" /> Peak season · best sightings</span>
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-mangrove/70" /> Very good shoulder months</span>
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-ocean/40" /> Warm & quiet forest</span>
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-mangrove/30" /> Green monsoon</span>
            </div>
          </motion.div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {goldenMoments.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-background rounded-2xl p-8 shadow-luxe"
              >
                <g.icon className="size-7 text-gold stroke-[1.2]" />
                <h3 className="mt-5 font-display text-xl">{g.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{g.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Naturalists & safety */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Fieldcraft & Safety"
            title={<>Wild encounters, <em className="not-italic">handled properly</em>.</>}
            description="The Sundarbans is not a zoo — and that is the point. Here is how we bring you close while keeping guests, crew and forest safe."
          />

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-luxe">
            {fieldcraft.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-background p-8 md:p-9"
              >
                <div className="size-12 rounded-2xl grid place-items-center border border-gold/20 bg-gold/5">
                  <f.icon className="size-5 text-gold" />
                </div>
                <h3 className="mt-5 font-display text-lg">{f.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 md:py-36 bg-secondary/40">
        <div className="container-luxe max-w-3xl">
          <SectionHeader
            align="center"
            eyebrow="Honest Answers"
            title={<>"Will I see a <em className="not-italic">tiger</em>?"</>}
            description="The questions every guest asks before sailing — answered the way our naturalists answer them on deck: honestly."
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="mt-12"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="py-6 text-base font-display font-normal hover:no-underline hover:text-gold-text transition-colors">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <CTA />
    </>
  );
}
