import { motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  Anchor, Compass, Sunrise, Trees, Waves, Camera, Bird, MapPin,
  Utensils, Footprints, Link2, Check,
} from "lucide-react";

import { copyToClipboard } from "@/lib/clipboard";

export type StopType = "wildlife" | "canal" | "dining" | "excursion" | "anchor";

export type Stop = {
  id: string;
  day: number;
  time: string;
  name: string;
  desc: string;
  highlights: string[];
  /** % position inside the SVG viewBox 0-100 */
  x: number;
  y: number;
  icon?: "anchor" | "trees" | "waves" | "camera" | "bird" | "sun" | "dining" | "trek";
  type?: StopType;
};

const iconFor = (k?: Stop["icon"]) => {
  switch (k) {
    case "anchor": return Anchor;
    case "trees": return Trees;
    case "waves": return Waves;
    case "camera": return Camera;
    case "bird": return Bird;
    case "sun": return Sunrise;
    case "dining": return Utensils;
    case "trek": return Footprints;
    default: return MapPin;
  }
};

const inferType = (s: Stop): StopType => {
  if (s.type) return s.type;
  switch (s.icon) {
    case "anchor": return "anchor";
    case "trees":
    case "bird": return "wildlife";
    case "waves": return "canal";
    case "dining": return "dining";
    case "camera":
    case "sun":
    case "trek": return "excursion";
    default: return "excursion";
  }
};

const TYPE_META: Record<StopType, { label: string; color: string; ring: string }> = {
  wildlife:  { label: "Wildlife",  color: "var(--mangrove)", ring: "ring-mangrove/40" },
  canal:     { label: "Canal",     color: "var(--teal)",     ring: "ring-teal/40" },
  dining:    { label: "Dining",    color: "var(--gold)",     ring: "ring-gold/40" },
  excursion: { label: "Excursion", color: "var(--ocean)",    ring: "ring-ocean/40" },
  anchor:    { label: "Port",      color: "var(--gold)",     ring: "ring-gold/40" },
};

export function ItineraryMap({
  stops,
  title,
  paramKey = "stop",
}: {
  stops: Stop[];
  title?: string;
  paramKey?: string;
}) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const select = (i: number) => {
    setActive(i);
  };

  const stop = stops[active];
  const Icon = iconFor(stop.icon);
  const activeType = inferType(stop);

  // Build a smooth path through stops
  const path = stops
    .map((s, i) => (i === 0 ? `M ${s.x} ${s.y}` : `S ${(stops[i - 1].x + s.x) / 2} ${(stops[i - 1].y + s.y) / 2 - 4}, ${s.x} ${s.y}`))
    .join(" ");

  const tooltipIdx = hover ?? active;
  const tip = stops[tooltipIdx];
  const tipType = inferType(tip);

  const copyLink = async () => {
    if (await copyToClipboard(window.location.href)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const usedTypes = Array.from(new Set(stops.map(inferType)));

  return (
    <div ref={containerRef} className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch scroll-mt-24">
      {/* Map canvas */}
      <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-linear-to-br from-mangrove/15 via-background to-teal/10 border border-border shadow-luxe">
        {/* paper texture */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--ocean) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }} />

        {/* compass */}
        <div className="absolute top-5 right-5 size-14 rounded-full glass-dark grid place-items-center text-gold z-10">
          <Compass className="size-6" />
        </div>
        <div className="absolute top-5 left-5 z-10">
          <div className="eyebrow text-mangrove text-[10px]">Itinerary Map</div>
          {title && <div className="font-display text-xl text-foreground mt-1">{title}</div>}
        </div>

        <svg viewBox="0 0 100 70" className="block w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={`water-${paramKey}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--ocean)" stopOpacity="0.20" />
            </linearGradient>
            <linearGradient id={`land-${paramKey}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--mangrove)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--mangrove)" stopOpacity="0.30" />
            </linearGradient>
          </defs>

          <rect width="100" height="70" fill={`url(#water-${paramKey})`} />

          <path d="M 0 0 L 100 0 L 100 18 C 80 22, 65 16, 50 22 C 35 28, 20 20, 0 26 Z" fill={`url(#land-${paramKey})`} />
          <path d="M 8 30 C 18 28, 25 34, 22 40 C 19 46, 10 44, 6 40 Z" fill={`url(#land-${paramKey})`} />
          <path d="M 32 36 C 44 32, 50 40, 46 48 C 40 54, 30 50, 28 44 Z" fill={`url(#land-${paramKey})`} />
          <path d="M 58 40 C 70 36, 78 44, 74 52 C 68 58, 56 54, 54 48 Z" fill={`url(#land-${paramKey})`} />
          <path d="M 82 32 C 92 30, 96 38, 92 46 C 86 50, 78 46, 78 40 Z" fill={`url(#land-${paramKey})`} />
          <path d="M 0 60 L 100 60 L 100 70 L 0 70 Z" fill={`url(#water-${paramKey})`} opacity="0.6" />

          <path d="M 12 4 C 20 14, 14 22, 22 30 C 30 38, 26 48, 36 56 C 48 62, 70 60, 92 54"
            stroke="var(--teal)" strokeWidth="0.4" fill="none" opacity="0.4" strokeDasharray="0.6 0.6" />

          <motion.path
            d={path}
            stroke="var(--gold)"
            strokeWidth="0.55"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="1.2 0.8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />

          {stops.map((s, i) => {
            const t = inferType(s);
            const c = TYPE_META[t].color;
            const isActive = i === active;
            return (
              <g
                key={s.id}
                onClick={() => select(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
              >
                <title>{`Day ${s.day} · ${s.name} — ${TYPE_META[t].label}`}</title>
                <circle cx={s.x} cy={s.y} r={isActive ? 2.8 : 1.8} fill={c} opacity="0.25">
                  <animate attributeName="r" values={`${isActive ? 2.8 : 1.8};${isActive ? 4.2 : 2.6};${isActive ? 2.8 : 1.8}`} dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={isActive ? 1.5 : 1.05}
                  fill={c}
                  stroke="var(--background)"
                  strokeWidth="0.3"
                />
                <text x={s.x} y={s.y - 2.4} fontSize="1.8" textAnchor="middle" className="font-display"
                  fill={isActive ? "var(--ocean)" : "var(--mangrove)"}
                  style={{ fontWeight: isActive ? 600 : 500 }}>
                  {s.name}
                </text>
                <text x={s.x} y={s.y + 3} fontSize="1.2" textAnchor="middle" fill="var(--gold)" letterSpacing="0.15">
                  DAY {s.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        <div
          className="pointer-events-none absolute glass-dark rounded-xl px-3.5 py-2.5 text-background shadow-lg transition-opacity duration-200"
          style={{
            left: `${tip.x}%`,
            top: `${tip.y}%`,
            transform: "translate(-50%, calc(-100% - 14px))",
            opacity: hover !== null || active >= 0 ? 1 : 0,
            maxWidth: "220px",
          }}
        >
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em]" style={{ color: TYPE_META[tipType].color }}>
            <span className="size-1.5 rounded-full" style={{ background: TYPE_META[tipType].color }} />
            {TYPE_META[tipType].label}
          </div>
          <div className="font-display text-base mt-0.5 leading-tight">{tip.name}</div>
          <div className="text-[10px] text-background/70 mt-0.5">Day {tip.day} · {tip.time}</div>
        </div>

        {/* Day chips */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 glass-dark rounded-full p-1.5 z-10">
          {stops.map((s, i) => (
            <button
              key={s.id}
              onClick={() => select(i)}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-semibold transition-colors ${
                i === active ? "bg-gold text-ocean" : "text-background/80 hover:text-gold"
              }`}
            >
              Day {s.day} · {s.time}
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <motion.aside
        key={stop.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-5 bg-card rounded-3xl p-8 lg:p-10 shadow-luxe border border-border flex flex-col"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 eyebrow text-gold text-[10px]">
            <span
              className="size-9 rounded-full grid place-items-center"
              style={{ background: `color-mix(in oklab, ${TYPE_META[activeType].color} 15%, transparent)`, color: TYPE_META[activeType].color }}
            >
              <Icon className="size-4" />
            </span>
            Day {stop.day} · {stop.time}
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] font-semibold"
            style={{
              background: `color-mix(in oklab, ${TYPE_META[activeType].color} 14%, transparent)`,
              color: TYPE_META[activeType].color,
            }}
          >
            {TYPE_META[activeType].label}
          </span>
        </div>

        <h3 className="font-display text-3xl md:text-4xl mt-5 leading-tight">{stop.name}</h3>
        <p className="mt-4 text-muted-foreground leading-relaxed">{stop.desc}</p>

        <div className="gold-rule my-7" />

        <div className="eyebrow text-mangrove text-[10px] mb-4">On this stop</div>
        <ul className="space-y-3">
          {stop.highlights.map((h) => (
            <li key={h} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 size-1.5 rounded-full bg-gold shrink-0" /> {h}
            </li>
          ))}
        </ul>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="eyebrow text-mangrove text-[10px] mb-3">Legend</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {usedTypes.map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ background: TYPE_META[t].color }} />
                {TYPE_META[t].label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <button
            onClick={() => select(Math.max(0, active - 1))}
            disabled={active === 0}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold disabled:opacity-30"
          >
            ← Prev day
          </button>

          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-[10px] uppercase tracking-[0.2em] text-mangrove hover:text-gold hover:border-gold transition-colors"
          >
            {copied ? <Check className="size-3" /> : <Link2 className="size-3" />}
            {copied ? "Copied" : "Share stop"}
          </button>

          <button
            onClick={() => select(Math.min(stops.length - 1, active + 1))}
            disabled={active === stops.length - 1}
            className="text-xs uppercase tracking-[0.2em] text-mangrove hover:text-gold disabled:opacity-30"
          >
            Next day →
          </button>
        </div>

        <div className="mt-3 text-[10px] tabular-nums text-muted-foreground text-center">
          {String(active + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}
        </div>
      </motion.aside>
    </div>
  );
}
