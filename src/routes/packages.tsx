import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, MapPin, Check, ArrowUpRight, Loader2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTA } from "@/components/site/CTA";
import { ItineraryMap, type Stop } from "@/components/site/ItineraryMap";
import { usePackages } from "@/hooks/queries/usePackages";
import { parseLocalDate } from "@/lib/dates";
import { formatBDT } from "@/lib/money";
import type { Package } from "@/lib/api/types";
import deck from "@/assets/deck-sunset.jpg";
import cabin from "@/assets/cabin-luxury.jpg";
import canal from "@/assets/canal-mangrove.jpg";
import dining from "@/assets/dining-bbq.jpg";

const PKG_KEYS = ["sig", "cpl", "fam", "cor", "pho", "chr"] as const;

export const Route = createFileRoute("/packages")({
  component: PackagesPage,
  validateSearch: (s: Record<string, unknown>) => {
    const out: Record<string, string> = {};
    for (const k of PKG_KEYS) {
      const v = s[k];
      if (typeof v === "string") out[k] = v;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Tour Packages — MV Alaska Sundarbans Cruise" },
      { name: "description", content: "Family, couple, corporate and full-ship charter packages aboard MV Alaska. 3-day Sundarbans expeditions with day-by-day interactive itinerary maps." },
    ],
  }),
});

// Curated visual/itinerary content the backend doesn't model (per-stop route,
// imagery, "included" copy). Matched to a real backend Package by
// marketing_title; any package without a match falls back to `fallbackTemplate`.
type MarketingTemplate = {
  img: string; tag: string; inc: string[]; itinerary: Stop[];
};

const signature: Stop[] = [
  { id: "s1", day: 1, time: "Morning", name: "Khulna", x: 12, y: 8, icon: "anchor",
    desc: "Welcome aboard MV Alaska at Khulna jetty. Champagne reception on the sky deck as we set sail south through the Rupsha river.",
    highlights: ["Boarding & welcome reception", "Suite check-in", "Sky-deck briefing", "Sundown sail through Rupsha"] },
  { id: "s2", day: 1, time: "Evening", name: "Mongla", x: 28, y: 22, icon: "waves",
    desc: "Cross into the Sundarbans buffer at Mongla. Sunset BBQ dinner on the open deck as the mangrove forest closes in around us.",
    highlights: ["Naturalist briefing", "Forest entry permits", "Open-deck BBQ night", "Mangrove silhouettes at dusk"] },
  { id: "s3", day: 2, time: "Dawn", name: "Karamjal", x: 40, y: 36, icon: "trees",
    desc: "Pre-dawn excursion to Karamjal wildlife center — crocodile breeding pools, deer sanctuary and a canopy boardwalk through the forest floor.",
    highlights: ["Sunrise canoe ride", "Deer & croc sanctuary", "Mangrove boardwalk", "Naturalist-led photo walk"] },
  { id: "s4", day: 2, time: "Afternoon", name: "Kotka", x: 62, y: 46, icon: "bird",
    desc: "Anchor near Kotka — the spiritual heart of the Sundarbans. Trek the watchtower, scan for Royal Bengal tigers and spotted deer at the meadow.",
    highlights: ["Tiger-tracking trek", "Watchtower viewpoint", "Open meadow safari", "Deck dinner under stars"] },
  { id: "s5", day: 3, time: "Sunrise", name: "Jamtola Beach", x: 78, y: 56, icon: "sun",
    desc: "Walk the wild Bay of Bengal coastline at Jamtola — the southern edge of the world's largest mangrove. Breakfast on the sand.",
    highlights: ["Sunrise beach walk", "Wild coast picnic", "Shell collecting", "Return sail to Khulna"] },
];

const couples: Stop[] = [
  { id: "c1", day: 1, time: "Morning", name: "Khulna", x: 12, y: 8, icon: "anchor",
    desc: "Honeymoon-suite check-in with rose petals and a hand-written welcome. Set sail south for an intimate first afternoon at sea.",
    highlights: ["Honeymoon suite", "Welcome champagne", "Couples spa intro", "Private deck lounger"] },
  { id: "c2", day: 1, time: "Sunset", name: "Hiron Point", x: 36, y: 30, icon: "sun",
    desc: "Anchor at Hiron Point. Candlelit private dinner on the upper deck served by your dedicated steward.",
    highlights: ["Private candle dinner", "Live acoustic set", "Sunset cruise", "Star-gazing deck"] },
  { id: "c3", day: 2, time: "Dawn", name: "Kotka", x: 58, y: 44, icon: "bird",
    desc: "Pre-dawn private canoe through tidal canals. Just the two of you, your guide, and a forest waking up.",
    highlights: ["Private canoe glide", "Birdwatching at dawn", "Couples breakfast on deck", "Naturalist-led trek"] },
  { id: "c4", day: 2, time: "Evening", name: "Dublar Char", x: 76, y: 56, icon: "waves",
    desc: "Anchor off Dublar Char. Couples spa ritual on the deck followed by a beach bonfire dinner.",
    highlights: ["Couples spa ritual", "Bonfire on the sand", "Bay of Bengal sunset", "Star-bath jacuzzi"] },
  { id: "c5", day: 3, time: "Morning", name: "Return — Khulna", x: 14, y: 12, icon: "anchor",
    desc: "Slow morning sail back through the mangrove. Brunch on deck, farewell gift, and a portrait keepsake from your voyage.",
    highlights: ["Brunch on deck", "Couples portrait shoot", "Farewell gift box", "Return at midday"] },
];

const family: Stop[] = [
  { id: "f1", day: 1, time: "Morning", name: "Khulna", x: 12, y: 8, icon: "anchor",
    desc: "Family-suite check-in with a kids' welcome kit, scavenger map and junior naturalist badge.",
    highlights: ["Family suite", "Kids' adventure kit", "Sky-deck welcome", "Family briefing"] },
  { id: "f2", day: 1, time: "Afternoon", name: "Karamjal", x: 32, y: 28, icon: "trees",
    desc: "Karamjal wildlife center — kids meet rescued crocodiles and spotted deer with our resident naturalist.",
    highlights: ["Wildlife center tour", "Junior naturalist activity", "Family canoe ride", "BBQ deck dinner"] },
  { id: "f3", day: 2, time: "Morning", name: "Andharmanik", x: 56, y: 42, icon: "bird",
    desc: "Andharmanik canal cruise — narrow tidal channels, kingfishers and macaques along the riverbank.",
    highlights: ["Canal expedition", "Kingfisher photo stop", "Forest watchtower climb", "Family picnic lunch"] },
  { id: "f4", day: 2, time: "Evening", name: "Kotka Meadow", x: 70, y: 52, icon: "sun",
    desc: "Open meadow safari at Kotka. Family stargazing event on the upper deck with a night-sky guide.",
    highlights: ["Open meadow walk", "Stargazing night", "Family movie deck", "Storytelling session"] },
  { id: "f5", day: 3, time: "Morning", name: "Return — Khulna", x: 14, y: 12, icon: "anchor",
    desc: "Sail home with a farewell breakfast, family portrait and printed scrapbook of the voyage.",
    highlights: ["Farewell breakfast", "Family portrait", "Printed scrapbook", "Disembarkation"] },
];

const photo: Stop[] = [
  { id: "p1", day: 1, time: "Morning", name: "Khulna", x: 12, y: 8, icon: "anchor",
    desc: "Pre-trip gear briefing with the resident wildlife photographer. Lens recommendations and shot list.",
    highlights: ["Gear briefing", "Pro photo guide", "Suite check-in", "Editing lounge access"] },
  { id: "p2", day: 1, time: "Sunset", name: "Kochikhali", x: 32, y: 26, icon: "camera",
    desc: "Golden-hour shoot at Kochikhali. Wide deltas, silhouetted boats and a working fishing village.",
    highlights: ["Golden-hour shoot", "Fishing village access", "Drone permits arranged", "Naturalist guide"] },
  { id: "p3", day: 2, time: "Pre-dawn", name: "Kotka Hide", x: 52, y: 42, icon: "bird",
    desc: "Pre-dawn departure to a hidden tiger blind. Long-lens session for tiger pugmarks, deer and rare birds.",
    highlights: ["Tiger-tracking blind", "Long-lens session", "Bird inventory walk", "Brunch on return"] },
  { id: "p4", day: 3, time: "Sunrise", name: "Hiron Point", x: 70, y: 50, icon: "sun",
    desc: "Sunrise photography at Hiron Point — the only protected zone where sambar deer feed at the water's edge.",
    highlights: ["Hiron Point sunrise", "Sambar deer at shore", "Estuary panoramas", "Editing review"] },
  { id: "p5", day: 4, time: "Morning", name: "Return — Khulna", x: 14, y: 12, icon: "anchor",
    desc: "Sail home with a guided edit session and a curated portfolio review with the on-board photographer.",
    highlights: ["Portfolio review", "Editing master-class", "Print of best shot", "Disembarkation"] },
];

const fallbackTemplate: MarketingTemplate = {
  img: deck, tag: "Sundarbans Voyage",
  inc: ["Cabin accommodation", "All meals", "Forest excursions", "Naturalist guide"],
  itinerary: signature,
};

const templatesByTitle: Record<string, MarketingTemplate> = {
  "Sundarbans Explorer": { img: deck, tag: "Most loved", inc: ["Private balcony cabin", "All meals + BBQ night", "Forest trekking", "Naturalist guide"], itinerary: signature },
  "Couple's Escape": { img: cabin, tag: "Romantic", inc: ["Honeymoon suite", "Candlelit deck dinner", "Private canoe ride", "Spa treatment"], itinerary: couples },
  "Family Discovery": { img: canal, tag: "Family", inc: ["Family suite", "Kids activities", "Forest watchtower", "Educational tours"], itinerary: family },
  "Corporate Retreat": { img: dining, tag: "Corporate", inc: ["Conference deck", "Full A/V setup", "Branded experience", "Group dining"], itinerary: signature },
  "Photographer's Expedition": { img: deck, tag: "Wildlife", inc: ["Tiger tracking", "Pre-dawn excursions", "Pro photo guide", "Hide blinds"], itinerary: photo },
};

function templateFor(pkg: Package): MarketingTemplate {
  return templatesByTitle[pkg.marketing_title] ?? fallbackTemplate;
}

const destinations = ["Andharmanik", "Kotka", "Jamtola Sea Beach", "Hiron Point", "Dublar Char", "Karamjal", "Kochikhali", "Dim Char"];

function PackagesPage() {
  const { data: packages, isLoading, isError } = usePackages();

  return (
    <>
      <PageHero
        eyebrow="Curated Voyages"
        title={<>Choose your <em className="not-italic text-gradient-gold">cinematic</em> 3 days.</>}
        subtitle="Hand-crafted itineraries through the most iconic corners of Sundarbans — each with an interactive day-by-day route map, on real upcoming sailing dates."
        image={deck}
      />

      <section className="py-16 bg-background border-b border-border">
        <div className="container-luxe">
          <div className="eyebrow text-gold mb-6">Destinations on every voyage</div>
          <div className="flex flex-wrap gap-3">
            {destinations.map((d) => (
              <span key={d} className="px-5 py-2.5 rounded-full border border-border text-sm flex items-center gap-2">
                <MapPin className="size-3.5 text-gold" /> {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 bg-background space-y-24 md:space-y-32">
        {isLoading && (
          <div className="container-luxe flex items-center justify-center gap-3 text-muted-foreground py-20">
            <Loader2 className="size-5 animate-spin" /> Loading upcoming voyages…
          </div>
        )}
        {isError && (
          <div className="container-luxe text-center py-20 text-muted-foreground">
            Couldn't load voyages right now — please try again shortly.
          </div>
        )}
        {packages && packages.length === 0 && (
          <div className="container-luxe text-center py-20 text-muted-foreground">
            No voyages are currently open for booking. Please check back soon.
          </div>
        )}
        {packages?.map((pkg, i) => {
          const tpl = templateFor(pkg);
          const title = pkg.marketing_title || `${pkg.ship.name} Voyage`;
          const dateRange = `${parseLocalDate(pkg.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${parseLocalDate(pkg.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
          return (
            <div key={pkg.id} className="container-luxe">
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7 }}
                className="group bg-card rounded-3xl overflow-hidden shadow-luxe grid md:grid-cols-5 mb-10"
              >
                <div className="relative md:col-span-2 aspect-[4/3] md:aspect-auto overflow-hidden">
                  <img src={pkg.hero_image ?? tpl.img} alt={title} loading="lazy" className="image-zoom absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass-dark text-gold eyebrow text-[10px]">{tpl.tag}</div>
                  <div className="absolute bottom-4 left-4 eyebrow text-background/80 text-[10px]">Voyage 0{i + 1}</div>
                  {pkg.booking_status === "closed" && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-destructive/90 text-destructive-foreground eyebrow text-[10px]">
                      Booking Closed
                    </div>
                  )}
                </div>
                <div className="md:col-span-3 p-7 lg:p-10 flex flex-col">
                  <h2 className="font-display text-3xl lg:text-4xl font-normal">{title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{pkg.marketing_description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-gold" /> {pkg.nights} Days · {pkg.nights - 1} Nights</span>
                    <span className="flex items-start gap-1.5"><MapPin className="size-3.5 text-gold mt-0.5" /> {dateRange}</span>
                  </div>
                  <ul className="mt-5 grid sm:grid-cols-2 gap-1.5 text-sm">
                    {(pkg.highlights.length ? pkg.highlights : tpl.inc).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="size-3.5 text-gold" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6 flex items-end justify-between border-t border-border">
                    <div>
                      <div className="eyebrow text-muted-foreground text-[10px]">From / adult</div>
                      <div className="font-display text-3xl">{formatBDT(pkg.adult_price)}</div>
                    </div>
                    {pkg.is_bookable ? (
                      <Link
                        to="/booking"
                        search={{ package: pkg.id }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-gold text-ocean text-[10px] uppercase tracking-[0.2em] font-semibold shadow-gold"
                      >
                        Reserve <ArrowUpRight className="size-3" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-semibold cursor-not-allowed">
                        Booking Closed
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>

              <div className="mt-12">
                <SectionHeader
                  eyebrow="Day-by-day route"
                  title={<>Tap any stop. <em className="not-italic text-gradient-gold">See the day unfold.</em></>}
                />
                <div className="mt-10">
                  <ItineraryMap stops={tpl.itinerary} title={title} paramKey={PKG_KEYS[i] ?? `pkg${i}`} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <CTA />
    </>
  );
}
