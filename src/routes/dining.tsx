import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, GlassWater, Leaf, MonitorPlay, UtensilsCrossed, Users, Wifi } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { FoodMenuSection } from "@/components/site/FoodMenuSection";
import { CTA } from "@/components/site/CTA";
import img106 from "@/assets/106.jpeg";
import img107 from "@/assets/107.jpeg";
import img110 from "@/assets/110.jpeg";
import deckSunset from "@/assets/deck-sunset.jpg";
import bbqNight from "@/assets/dining-bbq.jpg";
import prawnDish from "@/assets/dining/Prawn_served_on_plate_202607172043.jpeg";
import hilsaDish from "@/assets/dining/Smoked_River_Hilsa_served_on_202607172044.jpeg";
import bhartaDish from "@/assets/dining/Bengali_Bharta_Board_cruise_ship_202607172044.jpeg";
import dessertDish from "@/assets/dining/Bengali_dessert_table_cruise_ship_202607172045.jpeg";
import chefBbq from "@/assets/dining/Executive_Chef_preparing_food_BBQ_202607172048.jpeg";
import sunriseBuffetImg from "@/assets/dining/Sunrise Buffet.jpeg";
import deckLunchImg from "@/assets/dining/Deck Lunch.jpeg";
import sunsetBbqImg from "@/assets/dining/Sunset BBQ.jpeg";
import lateLoungeImg from "@/assets/dining/Late Lounge.jpeg";

export const Route = createFileRoute("/dining")({
  component: Dining,
  head: () => ({
    meta: [
      { title: "Dining Experience — MV Alaska Cruise" },
      { name: "description", content: "BBQ deck nights, buffet halls, traditional Bengali seafood, a chef-curated 3-day menu and an 80-pax conference suite aboard MV Alaska." },
    ],
  }),
});

const menus = [
  { img: sunriseBuffetImg, name: "Sunrise Buffet", time: "07:00 — 10:00", desc: "Continental, Bengali breakfast classics, fresh juices, espresso bar." },
  { img: deckLunchImg, name: "Deck Lunch", time: "13:00 — 15:00", desc: "Coastal salads, river fish curry, slow-braised meats, seasonal vegetables." },
  { img: sunsetBbqImg, name: "Sunset BBQ", time: "19:30 — 22:30", desc: "Live grill, prawn skewers, chargrilled seafood, candlelight, string lights." },
  { img: lateLoungeImg, name: "Late Lounge", time: "22:30 — late", desc: "Dessert tasting, herbal teas, cocktails under the stars on the open deck." },
];

const signatureDishes = [
  { no: "01", img: prawnDish, name: "Chargrilled Jumbo Prawn", desc: "Golda chingri from the delta's own rivers — live-grilled over charcoal on the BBQ deck, finished with lime butter." },
  { no: "02", img: hilsaDish, name: "Smoked River Hilsa", desc: "Bengal's most celebrated fish, slow-smoked and served the traditional way — a dish guests talk about long after the voyage." },
  { no: "03", img: bhartaDish, name: "Bengali Bharta Board", desc: "A spread of classic hand-pounded mashes and vortas with steamed rice — rustic, fiery, and utterly Sundarbans." },
  { no: "04", img: dessertDish, name: "Bhapa Doi & Sweet Table", desc: "Steamed sweet yogurt, seasonal pithas and Bengali mishti to close every dinner service." },
];

const venues = [
  { img: img107, name: "Main Dining Hall", desc: "Climate-controlled buffet restaurant with live serving stations — every guest seated in a single service." },
  { img: img106, name: "Sky Restaurant", desc: "Glass-walled upper-deck hall with panoramic river views on three sides — breakfast with the sunrise, lunch with the mangroves." },
  { img: deckSunset, name: "BBQ & Open Decks", desc: "String-lit open decks for grill nights, high tea and late lounge service under the stars." },
];

const goodToKnow = [
  { icon: UtensilsCrossed, title: "Every meal included", desc: "Breakfast, snacks, lunch and dinner — all three days, included in every package. No hidden food bills." },
  { icon: BadgeCheck, title: "Fully halal kitchen", desc: "Every dish onboard is prepared to halal standards by our own galley team." },
  { icon: Leaf, title: "Dietary requests", desc: "Vegetarian, allergies or kids' preferences — just note it in Special Requests when you book." },
  { icon: GlassWater, title: "Water, tea & coffee", desc: "Safe bottled drinking water at every table, with tea and coffee available through the day." },
];

const corporatePoints = [
  { icon: Users, text: "Seats up to 80 pax — theatre or banquet style" },
  { icon: MonitorPlay, text: "Large presentation display with full A/V support" },
  { icon: Wifi, text: "Starlink high-speed internet, even mid-river" },
  { icon: UtensilsCrossed, text: "Tea breaks, working lunches and gala BBQ dinners by our chefs" },
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
        <div className="container-luxe grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <SectionHeader
            eyebrow="The Experience"
            title={<>From the river. <em className="not-italic">To your plate.</em></>}
            description="Our chefs source fresh catch and seasonal produce daily. Every meal is a slow ritual — set against the backdrop of the world's wildest delta."
          />
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-luxe">
            <img src={img107} alt="MV Alaska dining hall" className="image-zoom absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Daily dining rhythm */}
      <section className="py-28 md:py-36 bg-secondary/30 border-y border-border">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="The Daily Rhythm"
            title={<>Four services. <em className="not-italic">Sunrise to starlight.</em></>}
            description="From the first espresso of the morning to desserts under the stars — this is how a day tastes aboard MV Alaska."
          />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {menus.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="group"
              >
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-luxe">
                  <img src={m.img} alt={m.name} className="image-zoom absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-ocean/85 via-ocean/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="eyebrow text-gold-soft text-[10px]">{m.time}</div>
                    <h3 className="mt-2 font-display text-2xl text-background">{m.name}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff-managed day-by-day menu */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="The Menu"
            title={<>Three days. <em className="not-italic">Twelve services.</em></>}
            description="What our galley actually serves, day by day. The exact spread varies by sailing as the chef selects from these dishes."
          />
          <div className="mt-16">
            <FoodMenuSection />
          </div>
        </div>
      </section>

      {/* Signature dishes */}
      <section className="py-28 md:py-36 bg-ocean text-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Signature Dishes"
            title={<>The plates that <em className="not-italic">define the voyage</em>.</>}
            light
          />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {signatureDishes.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group rounded-2xl overflow-hidden bg-background/5 border border-background/10"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <img src={d.img} alt={d.name} className="image-zoom absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="font-display text-2xl text-gold-soft/60">{d.no}</div>
                  <h3 className="mt-2 font-display text-xl">{d.name}</h3>
                  <p className="mt-2 text-sm text-background/70 leading-relaxed">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature night banner */}
      <section className="relative py-32 overflow-hidden">
        <img src={bbqNight} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ocean/75" />
        <div className="container-luxe relative text-center text-background">
          <div className="eyebrow text-gold-soft mb-5">◆ Signature Night</div>
          <h2 className="font-display text-4xl md:text-6xl font-light">The BBQ Deck Experience</h2>
          <p className="mt-6 max-w-2xl mx-auto text-background/80 text-lg">
            Live charcoal grill, jumbo prawns, river fish, hand-cut steaks. Candlelight on every table. Stars overhead. The Sundarbans as soundtrack.
          </p>
        </div>
      </section>

      {/* Dining venues */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe">
          <SectionHeader
            align="center"
            eyebrow="Where You Dine"
            title={<>Two restaurants. <em className="not-italic">One open sky.</em></>}
          />
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {venues.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group"
              >
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-luxe">
                  <img src={v.img} alt={v.name} className="image-zoom absolute inset-0 h-full w-full object-cover" />
                </div>
                <h3 className="mt-6 font-display text-2xl">{v.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate & private events */}
      <section className="py-28 md:py-36 bg-secondary/30 border-y border-border">
        <div className="container-luxe grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-luxe">
            <img src={img106} alt="MV Alaska conference suite" className="image-zoom absolute inset-0 h-full w-full object-cover" />
          </div>
          <div>
            <SectionHeader
              eyebrow="Corporate & Events"
              title={<>Meetings, <em className="not-italic">mid-river</em>.</>}
              description="Take the annual retreat, the launch, or the leadership offsite somewhere no boardroom can follow. Our conference suite hosts up to 80 pax — with the world's largest mangrove forest outside the windows."
            />
            <ul className="mt-8 space-y-4">
              {corporatePoints.map((p) => (
                <li key={p.text} className="flex items-start gap-3">
                  <p.icon className="size-5 text-gold stroke-[1.5] mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{p.text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-ocean text-primary-foreground px-8 py-3.5 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
            >
              Plan Your Event
            </Link>
          </div>
        </div>
      </section>

      {/* Good to know */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container-luxe">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
            {goodToKnow.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="bg-background p-8"
              >
                <g.icon className="size-6 text-gold stroke-[1.4]" />
                <h3 className="mt-4 font-display text-xl">{g.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef's note */}
      <section className="py-24 md:py-28 bg-background border-t border-border">
        <div className="container-luxe grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-16/10 rounded-2xl overflow-hidden shadow-luxe">
            <img src={chefBbq} alt="MV Alaska executive chef at the live BBQ grill" className="image-zoom absolute inset-0 h-full w-full object-cover" />
          </div>
          <div>
            <div className="eyebrow text-gold mb-6 flex items-center gap-3"><span className="h-px w-8 bg-current" /> A Note From The Galley</div>
            <blockquote className="font-display text-2xl md:text-3xl font-light leading-relaxed">
              "We cook the way the delta feeds us — what the river gives in the morning is on your table by night. Nothing rushed, nothing from a packet."
            </blockquote>
            <p className="mt-6 text-sm text-muted-foreground tracking-wide">— Executive Chef, MV Alaska</p>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
