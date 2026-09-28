import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { usePromotionFor } from "@/hooks/queries/usePromotions";

/** Height of this bar, published to CSS so the fixed navbar can sit below it.
 *
 *  The navbar is `position: fixed; top: 0`, so a bar above it would simply be
 *  covered. Rather than convert the navbar to static layout — it changes
 *  padding, rounding and background as the page scrolls, all of which depend on
 *  being fixed — it reads `top: var(--promo-bar-h, 0px)`, and this sets that
 *  variable from the bar's measured height. Measured rather than hardcoded
 *  because the text wraps to two lines on a narrow phone. */
const CSS_VAR = "--promo-bar-h";

/**
 * A slim gold bar pinned above the navigation, on every page of the site.
 *
 * The quiet half of the pair: the modal interrupts once and then honours its
 * dismissal, and this stays. Somebody who closed the modal on Tuesday can still
 * find the offer on Friday without it being pushed at them again — which is why
 * it is not dismissible, and why it carries no artwork or body copy.
 *
 * Renders nothing at all when no promotion is live, and clears the CSS variable
 * on the way out, so the navbar returns to the top of the viewport and every
 * page keeps its normal spacing the rest of the year.
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
      const height = ref.current?.offsetHeight ?? 0;
      root.style.setProperty(CSS_VAR, `${height}px`);
    };

    publish();

    // The bar grows a line when the viewport narrows, and the navbar has to
    // follow it down rather than overlap.
    const observer = new ResizeObserver(publish);
    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      root.style.removeProperty(CSS_VAR);
    };
  }, [promotion]);

  if (!promotion) return null;

  const hasLink = Boolean(promotion.cta_url);

  const content = (
    <>
      {promotion.badge_label && (
        <span className="shrink-0 rounded-full bg-midnight/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
          {promotion.badge_label}
        </span>
      )}
      {/* Truncates rather than wrapping on wide screens: a two-line bar stops
          being a bar and starts pushing the whole page down. */}
      <span className="truncate font-semibold">{promotion.title}</span>
      {promotion.subtitle && (
        <>
          <span aria-hidden="true" className="hidden opacity-45 sm:inline">
            ·
          </span>
          <span className="hidden truncate font-medium opacity-90 sm:inline">
            {promotion.subtitle}
          </span>
        </>
      )}
      {hasLink && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  // Solid gold with midnight text, matching OfferBadge: an opaque background
  // means the contrast does not depend on what is behind it on any given page.
  const inner =
    "group mx-auto flex w-full max-w-5xl items-center justify-center gap-2.5 px-4 text-sm text-midnight";

  return (
    // z-60 clears the navbar's z-50. Fixed rather than in the document flow so
    // it stays put over the full-bleed hero, which starts at the very top.
    <div
      ref={ref}
      className="fixed inset-x-0 top-0 z-[60] gradient-gold py-2 shadow-luxe"
    >
      {hasLink ? (
        /^https?:\/\//i.test(promotion.cta_url) ? (
          <a
            href={promotion.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${inner} transition hover:brightness-105`}
          >
            {content}
          </a>
        ) : (
          <Link to={promotion.cta_url} className={`${inner} transition hover:brightness-105`}>
            {content}
          </Link>
        )
      ) : (
        <div className={inner}>{content}</div>
      )}
    </div>
  );
}
