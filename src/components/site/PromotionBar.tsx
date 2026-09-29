import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { usePromotionsFor } from "@/hooks/queries/usePromotions";
import type { Promotion } from "@/lib/api/promotions";

/** Height of this bar, published to CSS so the fixed navbar can sit below it.
 *
 *  The navbar is `position: fixed; top: 0`, so a bar above it would simply be
 *  covered. Rather than convert the navbar to static layout — it changes
 *  padding, rounding and background as the page scrolls, all of which depend on
 *  being fixed — it reads `top: var(--promo-bar-h, 0px)`, and this sets that
 *  variable from the bar's measured height. */
const CSS_VAR = "--promo-bar-h";

/** How long each offer holds the bar before the next one takes it. Long enough
 *  to read a headline twice; short enough that the second offer is seen before
 *  a visitor scrolls past. */
const ROTATE_MS = 6000;

/** Dismissal is per browsing session, not forever.
 *
 *  sessionStorage, deliberately: an announcement bar the visitor can silence
 *  permanently is one staff can never reach them with again. Closed here means
 *  "not now", and the next visit starts fresh.
 *
 *  The key carries every shown promotion's id and updated_at, so publishing a
 *  new offer — or correcting an existing one — brings the bar back even within
 *  the same session. */
function dismissalKey(promotions: Promotion[]) {
  return `promo-bar-dismissed:${promotions
    .map((p) => `${p.id}@${p.updated_at}`)
    .join(",")}`;
}

function wasDismissed(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    // Storage blocked or unavailable. Show the bar: losing an announcement is
    // a worse failure than showing one the visitor already closed.
    return false;
  }
}

/**
 * A slim gold bar pinned above the navigation, on every page of the site.
 *
 * Deliberately shallow — around 36px. It sits above a fixed navbar, so every
 * pixel it takes is a pixel the navbar pushes down and the hero loses. The
 * content spreads across the full width rather than being centred in a narrow
 * column: the announcement reads from the left, the action sits at the right,
 * and nothing is stacked.
 *
 * With more than one live offer it cycles rather than stacking. Two bars is
 * twice the height stolen from every page, and picking one arbitrarily would
 * hide a sailing somebody might be looking for.
 */
export function PromotionBar() {
  const promotions = usePromotionsFor("top_bar");
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const key = useMemo(() => dismissalKey(promotions), [promotions]);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  // Re-evaluate whenever the live set changes, so a newly published offer
  // reopens a bar the visitor closed earlier in the session.
  useEffect(() => {
    setDismissed(promotions.length > 0 && wasDismissed(key));
    setIndex(0);
  }, [key, promotions.length]);

  const visible = promotions.length > 0 && !dismissed;

  useEffect(() => {
    if (!visible || promotions.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % promotions.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [visible, promotions.length]);

  useEffect(() => {
    const root = document.documentElement;

    if (!visible) {
      root.style.removeProperty(CSS_VAR);
      return;
    }

    const publish = () => {
      root.style.setProperty(CSS_VAR, `${ref.current?.offsetHeight ?? 0}px`);
    };
    publish();

    const observer = new ResizeObserver(publish);
    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      root.style.removeProperty(CSS_VAR);
    };
  }, [visible]);

  if (!visible) return null;

  const promotion = promotions[index] ?? promotions[0];

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Not persisted; it stays closed for this page at least.
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 24, stiffness: 260, delay: 0.15 }}
      // z-60 clears the navbar's z-50. Opaque gold, like OfferBadge: contrast
      // then never depends on what happens to be behind it on a given page.
      //
      // The two dark elements — the badge at one end, the button at the other —
      // are what make the band read as composed rather than as a plain strip of
      // colour. They bookend the line and give the eye somewhere to start and
      // finish. A hairline underneath separates the bar from the hero; a drop
      // shadow at 36px tall reads as a smudge.
      className="fixed inset-x-0 top-0 z-60 overflow-hidden border-b border-midnight/10 gradient-gold py-1.75"
    >
      {/* One sweep of light across the band shortly after it lands, then
          never again. It says "this is new" at the moment that is true and
          then gets out of the way; on a loop it would be a carnival sign, and
          on something pinned to every page that is unforgivable. Hidden from
          anyone who asked for reduced motion. */}
      {!reduceMotion && (
        <motion.span
          aria-hidden="true"
          initial={{ x: "-130%" }}
          animate={{ x: "130%" }}
          transition={{ delay: 1, duration: 1.4, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-white/25 blur-md"
        />
      )}

      <div className="relative container-luxe flex items-center gap-3 text-midnight">
        {/* mode="wait" so one offer has left before the next arrives — two
            headlines crossfading through each other is unreadable at this
            size. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={promotion.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex min-w-0 flex-1 items-center gap-2.5"
          >
            <BarContent promotion={promotion} />
          </motion.div>
        </AnimatePresence>

        {/* Which of several offers is showing. Dots rather than "1 / 3": at
            this size a fraction reads as part of the offer's own copy. */}
        {promotions.length > 1 && (
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            {promotions.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Show offer ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`size-1.5 rounded-full transition ${
                  i === index ? "bg-ocean" : "bg-midnight/25 hover:bg-midnight/50"
                }`}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide this announcement"
          title="Hide until next visit"
          className="-mr-1 shrink-0 rounded-full p-1 text-midnight/45 transition hover:bg-midnight/10 hover:text-midnight focus-visible:ring-2 focus-visible:ring-ocean/50 focus-visible:outline-none"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/** The announcement itself, wrapped in a link when it has somewhere to go.
 *
 *  Kept out of the row above so the close button and the dots stay OUTSIDE the
 *  link — nesting them would make "hide this" also navigate. */
function BarContent({ promotion }: { promotion: Promotion }) {
  const hasLink = Boolean(promotion.cta_url);
  const isExternal = /^https?:\/\//i.test(promotion.cta_url);

  const inner = (
    <>
      {promotion.badge_label ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-midnight px-2.5 py-0.75 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
          <Sparkles aria-hidden="true" className="size-2.5" />
          {promotion.badge_label}
        </span>
      ) : (
        <Sparkles aria-hidden="true" className="size-3.5 shrink-0 text-ocean/70" />
      )}

      {/* One line, always. A bar that wraps stops being a bar and starts
          pushing the whole page down — so the headline truncates and the
          supporting line is dropped on narrow screens rather than allowed to
          claim a second row. */}
      <span className="truncate text-[13px] font-semibold tracking-tight text-midnight">
        {promotion.title}
      </span>

      {promotion.subtitle && (
        <>
          {/* A drawn rule, not a "|" — the character sits on the text
              baseline and reads as punctuation belonging to the headline. */}
          <span
            aria-hidden="true"
            className="hidden h-3.5 w-px shrink-0 bg-midnight/20 md:block"
          />
          <span className="hidden truncate text-[12.5px] font-medium tracking-tight text-midnight/65 md:inline">
            {promotion.subtitle}
          </span>
        </>
      )}

      {hasLink && (
        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ocean px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gold transition duration-300 group-hover:bg-midnight">
          {promotion.cta_label || "View"}
          <ArrowRight
            aria-hidden="true"
            className="size-3 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </span>
      )}
    </>
  );

  const classes = "group flex min-w-0 flex-1 items-center gap-2.5";

  if (!hasLink) return <div className={classes}>{inner}</div>;

  return isExternal ? (
    <a
      href={promotion.cta_url}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {inner}
    </a>
  ) : (
    <Link to={promotion.cta_url} className={classes}>
      {inner}
    </Link>
  );
}
