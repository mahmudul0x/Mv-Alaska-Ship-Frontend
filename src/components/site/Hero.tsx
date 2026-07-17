import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero-cruise.jpg";
import img21 from "@/assets/21.jpeg";
import img23 from "@/assets/23.jpeg";
import tigerImg from "@/assets/wildlife-tiger.jpg";
import canalImg from "@/assets/canal-mangrove.jpg";
import shipVideo from "@/assets/MvalaskaVideo.mp4";

type Slide = {
  img: string;
  video?: string;
  eyebrow: string;
  title: ReactNode;
  sub: string;
};

const slides: Slide[] = [
  {
    img: canalImg,
    video: shipVideo,
    eyebrow: "◆ The Premium Brand For River Cruising",
    title: <>Luxury <em className="not-italic text-gradient-gold font-normal">Sundarbans</em><br />Cruise Experience</>,
    sub: "Explore the world's largest mangrove forest aboard Bangladesh's most luxurious government-approved cruise ship.",
  },
  {
    img: heroImg,
    eyebrow: "◆ Aboard M.V. Alaska",
    title: <>Your home <em className="not-italic text-gradient-gold font-normal">on</em><br />the river.</>,
    sub: "Three decks of comfort in motion — watch Alaska glide through the delta.",
  },
  {
    img: img21,
    eyebrow: "◆ Sundown On The Sky Deck",
    title: <>Golden hours <em className="not-italic text-gradient-gold font-normal">over</em><br />the wild delta.</>,
    sub: "Open-air sky decks, candlelit dinners and a sunset that stretches across the horizon.",
  },
  {
    img: img23,
    eyebrow: "◆ Cinematic Mangrove Canals",
    title: <>Drift through <em className="not-italic text-gradient-gold font-normal">untouched</em><br />green corridors.</>,
    sub: "Glide silently through narrow tidal canals, escorted by expert naturalists and silent canoes.",
  },
  {
    img: tigerImg,
    eyebrow: "◆ Royal Bengal Encounters",
    title: <>Where the <em className="not-italic text-gradient-gold font-normal">tiger</em><br />still rules.</>,
    sub: "Documentary-grade wildlife expeditions across Kotka, Hiron Point and Kochikhali.",
  },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    // Give the video slide extra time on screen before auto-advancing.
    const dur = slides[idx].video ? 12000 : 6000;
    const t = setTimeout(() => setIdx((i) => (i + 1) % slides.length), dur);
    return () => clearTimeout(t);
  }, [paused, idx]);

  const go = (dir: number) => setIdx((i) => (i + dir + slides.length) % slides.length);
  const slide = slides[idx];

  return (
    <section
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative h-[100svh] min-h-[720px] w-full overflow-hidden bg-ocean"
    >
      {/* Slider images with crossfade + parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <AnimatePresence mode="sync">
          {slide.video ? (
            <motion.video
              key={idx}
              src={slide.video}
              poster={slide.img}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.4 } }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <motion.img
              key={idx}
              src={slide.img}
              alt=""
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.4 }, scale: { duration: 7, ease: "linear" } }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-gradient-to-r from-ocean/50 via-transparent to-ocean/30" />
      <div className="absolute inset-0 hero-scrim" />
      {/* Extra shade for the video slide only — footage is brighter and busier
       * than the stills, so the copy needs more contrast behind it. */}
      <div
        className={`absolute inset-0 bg-ocean/35 transition-opacity duration-1000 ${
          slide.video ? "opacity-100" : "opacity-0"
        }`}
      />

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="absolute top-32 left-1/2 -translate-x-1/2 h-px w-40 origin-left bg-gradient-to-r from-transparent via-gold to-transparent"
      />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full container-luxe flex flex-col justify-center items-center text-center pt-16 -translate-y-16"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.8 }}
          >
            <div className="eyebrow text-gold-soft mb-6">{slide.eyebrow}</div>
            <h1 className="font-display text-background text-[clamp(2.5rem,7.5vw,7rem)] leading-[0.95] font-light tracking-tight">
              {slide.title}
            </h1>
            <p className="mt-8 max-w-xl mx-auto text-background/85 text-base md:text-lg leading-relaxed">
              {slide.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/booking"
            className="px-8 py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-gold hover-lift"
          >
            Book Your Journey
          </Link>
          <Link
            to="/packages"
            className="px-8 py-4 rounded-full border border-background/30 text-background text-xs uppercase tracking-[0.2em] font-medium hover:border-gold hover:text-gold transition-colors"
          >
            Explore Packages
          </Link>
        </motion.div>
      </motion.div>

      {/* Slide controls */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-4">
        <button
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="size-11 rounded-full glass text-background hover:text-gold grid place-items-center transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex flex-col gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className="group relative h-10 w-px bg-background/30"
            >
              <span
                className={`absolute inset-0 origin-top bg-gold transition-transform duration-500 ${
                  i === idx ? "scale-y-100" : "scale-y-0 group-hover:scale-y-50"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          aria-label="Next slide"
          onClick={() => go(1)}
          className="size-11 rounded-full glass text-background hover:text-gold grid place-items-center transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
        <div className="eyebrow text-background/60 text-[9px] tabular-nums">
          {String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </div>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute left-6 bottom-32 z-10 hidden md:flex flex-col items-center gap-3 text-background/60"
      >
        <div className="eyebrow [writing-mode:vertical-rl] rotate-180 text-[9px]">Scroll to discover</div>
        <ChevronDown className="size-4 animate-bounce" />
      </motion.div>
    </section>
  );
}
