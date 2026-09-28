import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, X } from "lucide-react";

import { usePromotionFor } from "@/hooks/queries/usePromotions";
import type { Promotion } from "@/lib/api/promotions";

/** One key per promotion *version*.
 *
 *  Including `updated_at` is the point: a visitor who closed "Eid Offer — 20%"
 *  should see it again when staff correct it to 25%, but should not see the
 *  unchanged one every day. Keying on id alone would silence corrections;
 *  keying on nothing would make "once" meaningless. */
function dismissalKey(promotion: Promotion) {
  return `promo-dismissed:${promotion.id}:${promotion.updated_at}`;
}

/** Whether this visitor has already dismissed this version, under the policy
 *  staff chose.
 *
 *  Every read is wrapped: in a private window, with site data blocked, or in a
 *  preview frame, `localStorage` can throw on access rather than return null.
 *  A storage failure must mean "show it" — losing a banner is a worse failure
 *  than showing one twice. */
function wasDismissed(promotion: Promotion): boolean {
  if (promotion.modal_frequency === "every_visit") return false;

  try {
    const raw = window.localStorage.getItem(dismissalKey(promotion));
    if (!raw) return false;
    if (promotion.modal_frequency === "once") return true;

    // "daily": the stored value is when it was dismissed.
    const dismissedAt = new Date(raw);
    if (Number.isNaN(dismissedAt.getTime())) return false;
    return Date.now() - dismissedAt.getTime() < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberDismissal(promotion: Promotion) {
  if (promotion.modal_frequency === "every_visit") return;
  try {
    window.localStorage.setItem(dismissalKey(promotion), new Date().toISOString());
  } catch {
    // Storage unavailable. The modal simply reappears next visit, which is
    // the tolerable end of this failure.
  }
}

/**
 * The promotion that opens by itself on the home page.
 *
 * The thing that makes this acceptable rather than an ad: it is dismissible by
 * three separate gestures (the button, Escape, the backdrop), it never
 * interrupts — the delay lets the page paint and be read first — and staff
 * choose a frequency, defaulting to once a day rather than every visit.
 *
 * Deliberately NOT a Radix Dialog despite Radix being available. A dialog that
 * the visitor never asked to open should not seize focus or lock scrolling the
 * instant it appears: a customer mid-sentence in the hero copy would lose
 * their place. This keeps the semantics (role, labelling, Escape, focusable
 * close) and drops the focus trap.
 */
export function PromotionModal() {
  const promotion = usePromotionFor("modal");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!promotion || wasDismissed(promotion)) return;

    const timer = window.setTimeout(
      () => setOpen(true),
      promotion.modal_delay_seconds * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [promotion]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!promotion) return null;

  function close() {
    setOpen(false);
    if (promotion) rememberDismissal(promotion);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop. A click here closes, which is the gesture most people
              try first — and it counts as a dismissal, not a postponement. */}
          <button
            type="button"
            aria-label="Close offer"
            onClick={close}
            className="absolute inset-0 cursor-default bg-midnight/70 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="promo-title"
            // Rises from the bottom on phones, where a sheet is the native
            // idiom; settles in place on larger screens.
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-luxe ring-1 ring-gold-soft/40"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close offer"
              // Sits above the artwork, so it carries its own dark scrim
              // rather than relying on whichever image staff uploaded.
              className="absolute right-3 top-3 z-10 rounded-full bg-midnight/60 p-2 text-white/90 backdrop-blur transition hover:bg-midnight/80 hover:text-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            {promotion.image_url && (
              <img
                src={promotion.image_url}
                alt=""
                // Decorative: everything it conveys is also in the text below,
                // so a screen reader announcing the filename would only add noise.
                className="h-44 w-full object-cover sm:h-52"
              />
            )}

            <div className="p-6 sm:p-7">
              {promotion.badge_label && (
                <span className="inline-flex items-center rounded-full gradient-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-midnight">
                  {promotion.badge_label}
                </span>
              )}

              <h2
                id="promo-title"
                className="mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
              >
                {promotion.title}
              </h2>

              {promotion.subtitle && (
                <p className="mt-2 text-base text-muted-foreground">
                  {promotion.subtitle}
                </p>
              )}

              {promotion.body && (
                // whitespace-pre-line so staff writing two short paragraphs in
                // the dashboard get two paragraphs on the site, without giving
                // them an HTML field to paste unsanitised markup into.
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {promotion.body}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {promotion.cta_label && promotion.cta_url && (
                  <PromotionCta
                    label={promotion.cta_label}
                    url={promotion.cta_url}
                    onNavigate={close}
                  />
                )}
                <button
                  type="button"
                  onClick={close}
                  className="text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The button.
 *
 *  Staff may type either an internal path or a full URL, so this picks the
 *  right element: an in-app Link keeps the router's client-side navigation,
 *  while an external address needs a real anchor with the usual rel guard. */
export function PromotionCta({
  label,
  url,
  onNavigate,
  className = "",
}: {
  label: string;
  url: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const classes = `inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-midnight shadow-luxe transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${className}`;
  const isExternal = /^https?:\/\//i.test(url);

  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={classes}
      >
        {label}
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </a>
    );
  }

  return (
    <Link to={url} onClick={onNavigate} className={classes}>
      {label}
      <ArrowUpRight aria-hidden="true" className="size-4" />
    </Link>
  );
}
