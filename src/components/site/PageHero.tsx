import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative h-[70svh] min-h-[520px] w-full overflow-hidden bg-ocean">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ocean via-ocean/60 to-ocean/30" />
      <div className="relative z-10 h-full container-luxe flex flex-col justify-end pb-20 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow text-gold-soft mb-4"
        >
          ◆ {eyebrow}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="font-display text-background text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] max-w-4xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-xl text-background/80 text-base md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}

