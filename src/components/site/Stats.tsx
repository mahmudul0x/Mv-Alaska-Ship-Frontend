import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Waves, Compass, BedDouble, Users } from "lucide-react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const dur = 2000;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const stats = [
  {
    icon: Waves,
    value: 12,
    suffix: "+",
    label: "Years on the River",
    desc: "A decade of mastering the Sundarbans delta",
  },
  {
    icon: Compass,
    value: 8,
    suffix: "",
    label: "Premium Destinations",
    desc: "Curated stops across the mangrove heartland",
  },
  {
    icon: BedDouble,
    value: 24,
    suffix: "",
    label: "Luxury Cabin Suites",
    desc: "Private balconies, river views, bespoke comfort",
  },
  {
    icon: Users,
    value: 6500,
    suffix: "+",
    label: "Guests Hosted",
    desc: "Travellers who chose the finest way to explore",
  },
];

export function Stats() {
  return (
    <section className="relative py-0 overflow-hidden">
      {/* Light cream background */}
      <div className="absolute inset-0 bg-background" />

      {/* Decorative gold lines */}
      <div className="absolute top-0 inset-x-0 gold-rule opacity-40" />
      <div className="absolute bottom-0 inset-x-0 gold-rule opacity-40" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gold/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-ocean/5 blur-[120px] pointer-events-none" />

      <div className="relative container-luxe py-24 md:py-32">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
            <span className="eyebrow text-gold-soft tracking-[0.3em]">By the numbers</span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-light text-ocean">
            A Legacy of <em className="not-italic text-gradient-gold">Excellence</em>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden shadow-luxe">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.1 }}
              className="group relative flex flex-col items-center text-center px-8 py-12 bg-background hover:bg-sand/60 transition-colors duration-500 cursor-default border border-border/60"
            >
              {/* Icon */}
              <div className="mb-6 size-14 rounded-2xl grid place-items-center border border-gold/20 bg-gold/5 group-hover:border-gold/50 group-hover:bg-gold/10 transition-all duration-500">
                <s.icon className="size-6 text-gold group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Number */}
              <div className="font-display text-[clamp(3rem,6vw,4.5rem)] leading-none font-light text-gradient-gold tabular-nums">
                <Counter to={s.value} suffix={s.suffix} />
              </div>

              {/* Divider */}
              <div className="my-4 w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

              {/* Label */}
              <div className="eyebrow text-ocean/80 tracking-[0.25em] text-[0.68rem]">{s.label}</div>

              {/* Description */}
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-45 group-hover:text-foreground/70 transition-colors duration-500">
                {s.desc}
              </p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-gold to-transparent" />
                <div className="absolute top-0 right-0 h-px w-8 bg-gradient-to-l from-gold to-transparent" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
