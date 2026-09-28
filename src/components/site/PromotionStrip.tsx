import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { usePromotionFor } from "@/hooks/queries/usePromotions";

/**
 * A slim gold strip across the hero.
 *
 * The quiet half of the pair: the modal interrupts once and then respects its
 * dismissal, and this stays. Someone who closed the modal on Tuesday can still
 * find the offer on Friday without it being pushed at them again — which is
 * why this is not dismissible, and why it carries no artwork or body copy.
 *
 * Scaled down to a single line on purpose. The hero's job is the photograph
 * and the headline; a promotion that competes with them costs more in
 * atmosphere than it wins in clicks.
 */
export function PromotionStrip({ className = "" }: { className?: string }) {
  const promotion = usePromotionFor("hero");
  if (!promotion) return null;

  const hasLink = Boolean(promotion.cta_url);

  const content = (
    <>
      {promotion.badge_label && (
        <span className="shrink-0 rounded-full bg-midnight/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
          {promotion.badge_label}
        </span>
      )}
      {/* The headline truncates rather than wrapping: a two-line strip stops
          being a strip and starts shoving the hero's own copy down the page. */}
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
          className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  // Solid gold with midnight text, matching OfferBadge: an opaque background
  // means the contrast does not depend on whichever photograph is behind the
  // hero that week.
  const base =
    "group flex w-full items-center gap-2.5 rounded-full gradient-gold px-4 py-2 text-sm text-midnight shadow-luxe ring-1 ring-gold-soft/50";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className={`w-full max-w-xl ${className}`}
    >
      {hasLink ? (
        /^https?:\/\//i.test(promotion.cta_url) ? (
          <a
            href={promotion.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${base} transition hover:brightness-105`}
          >
            {content}
          </a>
        ) : (
          <Link
            to={promotion.cta_url}
            className={`${base} transition hover:brightness-105`}
          >
            {content}
          </Link>
        )
      ) : (
        <div className={base}>{content}</div>
      )}
    </motion.div>
  );
}
