import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import hero from "@/assets/M.V._ALASKA_cruising_Sundarbans_202607171057.jpeg";

export function CTA() {
  return (
    <section className="relative py-28 md:py-36 bg-background">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-3xl shadow-luxe"
        >
          <img src={hero} alt="MV Alaska" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ocean via-ocean/80 to-ocean/30" />
          <div className="relative p-10 md:p-20 max-w-2xl">
            <div className="eyebrow text-gold-soft mb-5">◆ Begin Your Voyage</div>
            <h2 className="font-display text-background text-4xl md:text-6xl font-light leading-[1.05]">
              The river is waiting. <em className="not-italic">So is Alaska.</em>
            </h2>
            <p className="mt-6 text-background/75 text-base md:text-lg leading-relaxed">
              Reserve your suite for the next departure. Limited cabins each season — our most luxurious experiences sell out months in advance.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/booking"
                className="px-8 py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-luxe hover-lift inline-flex items-center gap-2"
              >
                Reserve Now <ArrowUpRight className="size-4" />
              </Link>
              <a
                href="https://wa.me/8801712823482"
                className="px-8 py-4 rounded-full border border-background/40 text-background text-xs uppercase tracking-[0.2em] font-medium hover:border-gold hover:text-gold transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
