import { motion } from "framer-motion";
import { Anchor, Shield, Wifi, Compass, Sparkles, Crown, Presentation, Waves } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import img104 from "@/assets/104.jpeg";

const features = [
  {
    icon: Crown,
    title: "Government-Approved",
    desc: "Bangladesh's largest, fully licensed luxury cruise authorized for Sundarbans expedition.",
  },
  {
    icon: Anchor,
    title: "Private Balcony Cabins",
    desc: "Floor-to-ceiling glass doors opening to your own river-facing terrace.",
  },
  {
    icon: Sparkles,
    title: "Five-Star Quality Dining",
    desc: "Buffet halls, BBQ deck nights, and curated Bengali seafood by master chefs.",
  },
  {
    icon: Shield,
    title: "Armed Forest Security",
    desc: "Trained forest guards & professional naturalists on every expedition.",
  },
  {
    icon: Wifi,
    title: "Starlink Internet",
    desc: "Stay connected from the deepest mangrove canals with high-speed satellite Wi-Fi.",
  },
  {
    icon: Compass,
    title: "Expert Naturalists",
    desc: "Decades of Sundarbans experience guiding wildlife sightings and storytelling.",
  },
  {
    icon: Presentation,
    title: "Corporate Meetings & Events",
    desc: "A dedicated onboard conference suite for corporate retreats, meetings and celebrations — in the heart of the wild.",
  },
  {
    icon: Waves,
    title: "Pool & Open Sky Deck",
    desc: "Swim above the river, then unwind under the stars on the open-air sky deck.",
  },
];

export function WhyChoose() {
  return (
    <section className="relative py-28 md:py-40 bg-background overflow-hidden">
      <div className="container-luxe relative">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start space-y-8">
            <SectionHeader
              eyebrow="Why MV Alaska"
              title={<>The most refined way to discover Sundarbans.</>}
              description="A floating five-star sanctuary engineered for travellers who refuse to compromise on comfort while seeking the wild."
            />
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-luxe">
              <img src={img104} alt="MV Alaska grand lobby" loading="lazy" className="image-zoom absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-border">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="bg-background p-8 group hover:bg-secondary/50 transition-colors"
              >
                <f.icon className="size-7 text-gold stroke-[1.2]" />
                <h3 className="mt-6 font-display text-2xl font-normal">{f.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
