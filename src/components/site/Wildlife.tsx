import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionHeader } from "./SectionHeader";
import tiger from "@/assets/wildlife-tiger.jpg";
import deer from "@/assets/wildlife-deer.jpg";
import bird from "@/assets/wildlife-bird.jpg";

const stories = [
  {
    img: tiger,
    chapter: "Chapter I",
    title: "The Royal Bengal",
    body: "The Sundarbans is the only mangrove on earth where the tiger walks. Our naturalists have spent lifetimes reading its silence.",
  },
  {
    img: deer,
    chapter: "Chapter II",
    title: "The Forest Awakens",
    body: "Spotted deer drift through morning mist. From the ship's deck, the entire wild theatre unfolds quietly.",
  },
  {
    img: bird,
    chapter: "Chapter III",
    title: "Wings Over Water",
    body: "Kingfishers, white-bellied sea eagles, and a hundred unnamed songbirds — the canopy is a living symphony.",
  },
];

export function Wildlife() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative py-28 md:py-40 bg-background overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute -left-40 top-1/3 size-[500px] rounded-full bg-mangrove/10 blur-3xl"
      />
      <div className="container-luxe relative">
        <SectionHeader
          align="center"
          eyebrow="Wildlife Storytelling"
          title={<>Where the wild still <em className="not-italic text-gradient-gold">writes the rules</em>.</>}
          description="A documentary-style expedition through the world's largest mangrove ecosystem — guided, narrated, photographed."
        />

        <div className="mt-20 space-y-32 md:space-y-44">
          {stories.map((s, i) => (
            <div
              key={s.title}
              className={`grid lg:grid-cols-12 gap-8 lg:gap-16 items-center ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="lg:col-span-7 group relative overflow-hidden rounded-2xl shadow-luxe aspect-[4/3] md:aspect-[16/10]"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="image-zoom absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full glass-dark text-gold-soft eyebrow text-[10px]">
                  {s.chapter}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-5"
              >
                <div className="eyebrow text-gold mb-4">{s.chapter}</div>
                <h3 className="font-display text-4xl md:text-5xl font-light leading-[1.05]">{s.title}</h3>
                <div className="mt-6 h-px w-16 bg-gold" />
                <p className="mt-6 text-muted-foreground leading-relaxed text-base">{s.body}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
