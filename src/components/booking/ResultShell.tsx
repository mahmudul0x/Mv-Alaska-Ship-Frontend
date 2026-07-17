import type { ReactNode } from "react";
import { motion } from "framer-motion";

import img109 from "@/assets/109.jpeg";

type Tone = "success" | "error" | "neutral";

const toneStyles: Record<Tone, string> = {
  success: "gradient-gold text-ocean shadow-luxe",
  error: "bg-destructive/15 text-red-200 ring-1 ring-destructive/40 backdrop-blur-md",
  neutral: "bg-white/10 text-background ring-1 ring-white/20 backdrop-blur-md",
};

/**
 * Shared page shell for booking-outcome pages (payment success / fail /
 * cancel, booking lookup). Renders the branded hero band with an icon +
 * headline, then the page content in a centered column overlapping the band.
 */
export function ResultShell({
  tone = "neutral",
  icon,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  tone?: Tone;
  icon: ReactNode;
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero band */}
      <div className="relative overflow-hidden bg-ocean">
        <img
          src={img109}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ocean via-ocean/80 to-ocean/50" />
        <div className="relative z-10 container-luxe pt-32 pb-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className={`size-16 rounded-full grid place-items-center mb-5 ${toneStyles[tone]}`}
          >
            {icon}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="eyebrow text-gold-soft mb-2.5"
          >
            {eyebrow}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl md:text-5xl text-background font-light leading-tight"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 max-w-xl text-background/70 text-sm md:text-base leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>

      {/* Content column overlapping the band */}
      <div className="container-luxe max-w-2xl relative z-20 -mt-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="space-y-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
