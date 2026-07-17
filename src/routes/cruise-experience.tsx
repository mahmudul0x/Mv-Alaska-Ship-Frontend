import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Anchor, Wifi, Wind, Coffee, Shield, Compass, Crown, Bed, Bath, Eye, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTA } from "@/components/site/CTA";
import { ItineraryMap, type Stop } from "@/components/site/ItineraryMap";
import { FoodMenuSection } from "@/components/site/FoodMenuSection";
import deck from "@/assets/deck-sunset.jpg";
import cabin from "@/assets/cabin-luxury.jpg";
import dining from "@/assets/dining-bbq.jpg";

export const Route = createFileRoute("/cruise-experience")({
  component: CruiseExp,
  validateSearch: (s: Record<string, unknown>) => {
    const stop = s.stop;
    return typeof stop === "string" ? { stop } : {};
  },
  head: () => ({
    meta: [
      { title: "Onboard Experience — MV Alaska Cruise" },
      { name: "description", content: "Pool deck, conference hall, BBQ deck, prayer room, lounges, Starlink internet — every facility on MV Alaska, plus a day-by-day expedition map." },
    ],
  }),
});

const facilities = [
  { icon: Crown, name: "Private Balcony Cabins", desc: "River-facing glass doors and warm wood interiors." },
  { icon: Eye, name: "Panorama View Rooms", desc: "Floor-to-ceiling windows, uninterrupted horizon." },
  { icon: Sparkles, name: "Open Sky Pool Deck", desc: "Infinity-style plunge pool with sunset bar." },
  { icon: Coffee, name: "Buffet Dining Hall", desc: "Climate-controlled fine dining with live stations." },
  { icon: Anchor, name: "BBQ Deck", desc: "Live grill nights under string lights and stars." },
  { icon: Users, name: "Conference Hall", desc: "Full A/V suite for corporate retreats and events." },
  { icon: Bed, name: "Indoor Games Lounge", desc: "Carrom, board games, premium card lounge." },
  { icon: Bath, name: "Prayer Room", desc: "Dedicated quiet space with ablution facilities." },
  { icon: Coffee, name: "Adda Lounge", desc: "Sophisticated café-style social space." },
  { icon: Wind, name: "Wildlife Viewing Deck", desc: "Telescopes, naturalist briefings, photo blinds." },
  { icon: Wifi, name: "Starlink Internet", desc: "High-speed satellite Wi-Fi across the entire ship." },
  { icon: Shield, name: "Armed Forest Security", desc: "Trained forest guards on every expedition." },
  { icon: Compass, name: "Naturalist Guides", desc: "Bangladesh's most experienced Sundarbans guides." },
];

const journey: Stop[] = [
  {
    id: "embark", day: 1, time: "11:00", name: "Khulna", x: 12, y: 8, icon: "anchor", type: "anchor",
    desc: "The voyage begins at Khulna jetty. A champagne welcome on the sky deck and a ceremonial conch as MV Alaska eases away from the dock and turns south down the Rupsha river.",
    highlights: ["Champagne welcome on the sky deck", "Suite check-in with cold towel service", "Captain's safety brief", "First lunch service as we set sail"],
  },
  {
    id: "rupsha", day: 1, time: "16:30", name: "Rupsha Bend", x: 28, y: 22, icon: "waves", type: "canal",
    desc: "Quiet golden-hour cruise as the Rupsha narrows into the Pasur. Naturalists set up telescopes on the wildlife deck — first sightings of brahminy kites circling the channel.",
    highlights: ["Naturalist briefing with maps", "Brahminy kite sightings", "High tea on the upper deck", "First mangrove silhouettes at dusk"],
  },
  {
    id: "bbq", day: 1, time: "20:00", name: "Mongla Anchorage", x: 40, y: 30, icon: "dining", type: "dining",
    desc: "Drop anchor in the buffer zone off Mongla. The BBQ deck opens — live grill, river prawn, smoked hilsa, lantern-lit tables under the open sky.",
    highlights: ["Open-air BBQ banquet", "River prawn & smoked hilsa", "Live acoustic set", "Stargazing from the lounge deck"],
  },
  {
    id: "karamjal", day: 2, time: "06:30", name: "Karamjal", x: 52, y: 40, icon: "trees", type: "wildlife",
    desc: "Pre-dawn tender to Karamjal wildlife center. Walk the canopy boardwalk past the crocodile breeding pools and a sanctuary of spotted deer.",
    highlights: ["Sunrise tender ride", "Crocodile breeding pools", "Spotted deer sanctuary", "Canopy boardwalk loop"],
  },
  {
    id: "andharmanik", day: 2, time: "11:00", name: "Andharmanik Canal", x: 64, y: 46, icon: "bird", type: "canal",
    desc: "Switch to small canoes and slip into the narrow Andharmanik tidal canals. Kingfishers, macaques, and the constant rustle of the mangrove canopy pressing in on both sides.",
    highlights: ["Small-craft canal expedition", "Kingfisher photo stop", "Macaque troop encounters", "Tidal-channel naturalist talk"],
  },
  {
    id: "kotka", day: 2, time: "16:00", name: "Kotka Watchtower", x: 76, y: 52, icon: "trek", type: "excursion",
    desc: "Anchor near Kotka — the spiritual heart of the Sundarbans. Trek the watchtower trail and scan the open meadow for Royal Bengal tigers, wild boar and herds of spotted deer.",
    highlights: ["Tiger-tracking watchtower trek", "Open meadow safari", "Sundarbans interpretive walk", "Deck dinner under stars"],
  },
  {
    id: "jamtola", day: 3, time: "06:00", name: "Jamtola Sea Beach", x: 84, y: 60, icon: "sun", type: "excursion",
    desc: "Walk the wild Bay of Bengal coastline at Jamtola — the southernmost edge of the world's largest mangrove. Sunrise breakfast served on the sand.",
    highlights: ["Sunrise beach walk", "Picnic breakfast on the sand", "Shell collecting", "Final group portrait"],
  },
  {
    id: "return", day: 3, time: "17:00", name: "Return — Khulna", x: 14, y: 12, icon: "anchor", type: "anchor",
    desc: "A long, slow sail north through the mangrove. Farewell brunch on deck, a printed log of your voyage, and a portrait keepsake before disembarkation at Khulna.",
    highlights: ["Farewell brunch service", "Printed voyage log", "Portrait keepsake", "Disembarkation at Khulna jetty"],
  },
];

function CruiseExp() {
  return (
    <>
      <PageHero
        eyebrow="Onboard"
        title={<>The <em className="not-italic">ship</em>, in detail.</>}
        subtitle="Every facility, every detail — engineered for slow, immersive luxury."
        image={deck}
      />

      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Facilities & Amenities"
            title={<>Everything you'd expect — <em className="not-italic">and more</em>.</>}
          />

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {facilities.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.05 }}
                className="bg-background p-8 hover:bg-secondary/40 transition-colors"
              >
                <f.icon className="size-7 text-gold stroke-[1.2]" />
                <h3 className="mt-5 font-display text-2xl">{f.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Onboard dining */}
      <section className="py-28 md:py-36 bg-background border-t border-border">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Onboard Dining"
            title={<>Three days. <em className="not-italic">A feast every stop.</em></>}
            description="A day-by-day look at what our chef prepares onboard — the exact spread varies by sailing as the chef selects from these dishes."
          />
          <div className="mt-16">
            <FoodMenuSection />
          </div>
        </div>
      </section>

      {/* Day-by-day journey storytelling */}
      <section className="py-28 md:py-36 bg-secondary/30 border-y border-border">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="The Journey"
            title={<>Three days. Eight stops. <em className="not-italic">One cinematic arc.</em></>}
            description="A guided walk through every moment aboard MV Alaska — from the champagne welcome at Khulna to the wild Bay of Bengal coastline at Jamtola. Tap any node on the map, hover for context, or share a single stop with a friend."
          />
          <div className="mt-16">
            <ItineraryMap stops={journey} title="The Signature Expedition" paramKey="stop" />
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[500px]">
          <img src={cabin} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="bg-ocean text-background p-12 md:p-20 flex flex-col justify-center">
          <div className="eyebrow text-gold-soft mb-5">◆ The Ship</div>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">A floating five-star hotel — not a boat.</h2>
          <p className="mt-6 text-background/75 leading-relaxed">
            MV Alaska is engineered like a luxury hotel that happens to navigate. Three full decks, thirty-one suites, two restaurants, a pool, a conference suite, and a crew trained in five-star hospitality.
          </p>
        </div>
        <div className="bg-mangrove text-background p-12 md:p-20 flex flex-col justify-center md:order-3">
          <div className="eyebrow text-gold-soft mb-5">◆ The Crew</div>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">Forty hands. One mission.</h2>
          <p className="mt-6 text-background/75 leading-relaxed">
            From the master chef to the naturalists to the housekeeping team — every crew member is hand-picked, trained, and committed to making your voyage unforgettable.
          </p>
        </div>
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[500px] md:order-4">
          <img src={dining} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </section>

      <CTA />
    </>
  );
}
