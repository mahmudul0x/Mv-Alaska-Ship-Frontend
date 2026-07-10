import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const reviews = [
  {
    name: "Tasnim Rahman",
    role: "Corporate Retreat · Dhaka",
    text: "The most elegant cruise experience in Bangladesh — bar none. Our entire executive team felt like guests of an international expedition company.",
  },
  {
    name: "Marc & Eloise Vermeer",
    role: "Travelers · Netherlands",
    text: "We've cruised the Mekong, the Nile, the Amazon. MV Alaska holds its own — service, food, and an unforgettable tiger sighting at sunrise.",
  },
  {
    name: "Faisal Ahmed",
    role: "Family Voyage · Khulna",
    text: "Three generations on board. Grandparents loved the calm, the kids loved the wildlife, my wife loved the BBQ deck. Genuinely unforgettable.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-28 md:py-36 gradient-ocean overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="container-luxe relative">
        <SectionHeader
          light
          align="center"
          eyebrow="Guest Stories"
          title={<>What our travellers <em className="not-italic text-gradient-gold">remember</em>.</>}
        />

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.figure
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass rounded-2xl p-8 text-background flex flex-col"
            >
              <Quote className="size-8 text-gold mb-6" />
              <blockquote className="text-background/85 text-lg leading-relaxed font-display font-light italic">
                "{r.text}"
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-white/10">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-gold-soft mt-1 eyebrow">{r.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
