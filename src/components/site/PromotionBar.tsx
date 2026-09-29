import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { usePromotionFor } from "@/hooks/queries/usePromotions";

/** Height of this bar, published to CSS so the fixed navbar can sit below it.
 *
 *  The navbar is `position: fixed; top: 0`, so a bar above it would simply be
 *  covered. Rather than convert the navbar to static layout — it changes
 *  padding, rounding and background as the page scrolls, all of which depend on
 *  being fixed — it reads `top: var(--promo-bar-h, 0px)`, and this sets that
 *  variable from the bar's measured height. Measured rather than hardcoded
 *  because the bar is one line on a phone and one line on a desktop, but not
 *  the same line. */
const CSS_VAR = "--promo-bar-h";

/**
 * A slim gold bar pinned above the navigation, on every page of the site.
 *
 * Deliberately shallow — around 36px. It sits above a fixed navbar, so every
 * pixel it takes is a pixel the navbar pushes down and the hero loses. The
 * first version centred one line of text in a narrow column, which left both
 * ends empty and made the bar look taller than it needed to be; this spreads
 * the same content across the full width instead: the announcement reads from
 * the left, the action sits at the right, and nothing is stacked.
 *
 * The quiet half of the pair. The modal interrupts once and then honours its
 * dismissal; this stays, so somebody who closed the modal on Tuesday can still
 * find the offer on Friday without it being pushed at them again.
 */
export function PromotionBar() {
  const promotion = usePromotionFor("top_bar");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    if (!promotion) {
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
  }, [promotion]);

  if (!promotion) return null;

  const hasLink = Boolean(promotion.cta_url);
  const isExternal = /^https?:\/\//i.test(promotion.cta_url);

  const action = (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-midnight/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] transition group-hover:bg-midnight/20">
      {promotion.cta_label || "View"}
      <ArrowRight
        aria-hidden="true"
        className="size-3 transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </span>
  );

  const content = (
    <>
      {promotion.badge_label ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-midnight px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
          <Sparkles aria-hidden="true" className="size-2.5" />
          {promotion.badge_label}
        </span>
      ) : (
        <Sparkles aria-hidden="true" className="size-3.5 shrink-0" />
      )}

      {/* One line, always. A bar that wraps stops being a bar and starts
          pushing the whole page down — so the headline truncates and the
          supporting line is simply dropped on narrow screens rather than
          allowed to claim a second row. */}
      <span className="truncate text-[13px] font-semibold tracking-tight">
        {promotion.title}
      </span>

      {promotion.subtitle && (
        <>
          <span aria-hidden="true" className="hidden opacity-30 md:inline">
            |
          </span>
          <span className="hidden truncate text-[13px] font-medium opacity-80 md:inline">
            {promotion.subtitle}
          </span>
        </>
      )}

      {/* Pushes the action to the far right, which is the whole point of the
          rework: the ends of the bar carry something instead of being padding. */}
      {hasLink && <span className="ml-auto" />}
      {hasLink && action}
    </>
  );

  const inner =
    "group container-luxe flex w-full items-center gap-2.5 text-midnight";

  return (
    <motion.div
      ref={ref}
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 24, stiffness: 260, delay: 0.15 }}
      // z-60 clears the navbar's z-50. Opaque gold, like OfferBadge: contrast
      // then never depends on what happens to be behind it on a given page.
      className="fixed inset-x-0 top-0 z-60 gradient-gold py-[7px] shadow-[0_1px_12px_rgba(0,0,0,0.18)]"
    >
      {hasLink ? (
        isExternal ? (
          <a
            href={promotion.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className={inner}
          >
            {content}
          </a>
        ) : (
          <Link to={promotion.cta_url} className={inner}>
            {content}
          </Link>
        )
      ) : (
        <div className={inner}>{content}</div>
      )}
    </motion.div>
  );
}
