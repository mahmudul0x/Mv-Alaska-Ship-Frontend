import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, X } from "lucide-react";

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
    // Storage unavailable. The modal reappears next visit, which is the
    // tolerable end of this failure.
  }
}

/**
 * The promotion that opens by itself on the home page.
 *
 * What keeps this from reading as an ad: three separate gestures dismiss it
 * (the button, Escape, the backdrop), it never interrupts — the delay lets the
 * page paint and be read first — and staff choose a frequency that defaults to
 * once a day rather than every visit.
 *
 * Deliberately NOT a Radix Dialog despite Radix being available. A dialog the
 * visitor never asked to open should not seize focus or lock scrolling the
 * instant it appears: a customer mid-sentence in the hero copy would lose their
 * place. This keeps the semantics (role, labelling, Escape, focusable close)
 * and drops the focus trap.
 *
 * The entrance is a sequence rather than one movement. The backdrop settles
 * first, the card follows on a spring, and only then do the badge, headline,
 * copy and buttons arrive in turn — the eye is led down the card in reading
 * order instead of being handed everything at once. All of it collapses to a
 * plain fade when the visitor has asked for reduced motion.
 */
export function PromotionModal() {
  const promotion = usePromotionFor("modal");
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

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

  // One shared stagger for everything inside the card, so the rhythm is
  // defined once instead of by a pile of hand-tuned delays.
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: 0.12 },
    },
  };
  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: "spring" as const, damping: 22, stiffness: 300 },
        },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Backdrop. A click here closes, which is the gesture most people
              try first — and it counts as a dismissal, not a postponement. */}
          <motion.button
            type="button"
            aria-label="Close offer"
            onClick={close}
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(6px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 cursor-default bg-midnight/75"
          />

          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="promo-title"
            // Rises from the bottom on phones, where a sheet is the native
            // idiom; settles in place on larger screens.
            initial={reduceMotion ? { opacity: 0 } : { y: 48, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 24, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-gold-soft/40"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close offer"
              // Carries its own scrim so it stays legible over whichever image
              // staff uploaded. Rotates on hover — a small acknowledgement that
              // the control is live.
              className="absolute right-3.5 top-3.5 z-10 rounded-full bg-midnight/55 p-2 text-white/90 backdrop-blur-sm transition duration-300 hover:rotate-90 hover:bg-midnight/80 hover:text-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            {promotion.image_url && (
              <div className="relative h-48 overflow-hidden sm:h-56">
                <motion.img
                  src={promotion.image_url}
                  alt=""
                  // Decorative: everything it conveys is also in the text below.
                  // A slow drift inwards gives the card life without asking the
                  // visitor to watch anything — it has settled by the time they
                  // have finished reading the headline.
                  initial={reduceMotion ? {} : { scale: 1.12 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 7, ease: "easeOut" }}
                  className="size-full object-cover"
                />
                {/* Grounds the artwork into the card instead of leaving a hard
                    seam where the photograph stops. */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-card to-transparent" />
              </div>
            )}

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="px-6 pb-6 pt-1 sm:px-8 sm:pb-8"
            >
              {promotion.badge_label && (
                <motion.div variants={item}>
                  <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full gradient-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-midnight">
                    <Sparkles aria-hidden="true" className="size-2.5" />
                    {promotion.badge_label}
                    {/* A single sweep of light across the badge, once, shortly
                        after it lands. Repeating it would turn the card into a
                        slot machine. */}
                    {!reduceMotion && (
                      <motion.span
                        aria-hidden="true"
                        initial={{ x: "-120%" }}
                        animate={{ x: "220%" }}
                        transition={{ delay: 0.9, duration: 1.1, ease: "easeInOut" }}
                        className="absolute inset-y-0 w-1/3 bg-white/35 blur-[6px]"
                      />
                    )}
                  </span>
                </motion.div>
              )}

              <motion.h2
                variants={item}
                id="promo-title"
                className="mt-3 font-display text-3xl leading-[1.1] text-foreground sm:text-4xl"
              >
                {promotion.title}
              </motion.h2>

              {/* Draws itself under the headline as the card settles — the one
                  flourish, and it doubles as the rule separating title from
                  copy. */}
              <motion.div
                variants={item}
                className="mt-3 h-px w-16 origin-left gradient-gold"
                initial={reduceMotion ? {} : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
              />

              {promotion.subtitle && (
                <motion.p
                  variants={item}
                  className="mt-3 text-base text-muted-foreground"
                >
                  {promotion.subtitle}
                </motion.p>
              )}

              {promotion.body && (
                // whitespace-pre-line so staff writing two short paragraphs in
                // the dashboard get two paragraphs on the site, without being
                // handed an HTML field to paste unsanitised markup into.
                <motion.p
                  variants={item}
                  className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
                >
                  {promotion.body}
                </motion.p>
              )}

              <motion.div
                variants={item}
                className="mt-7 flex flex-wrap items-center gap-4"
              >
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
              </motion.div>
            </motion.div>
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
  const classes = `group inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-midnight shadow-luxe transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${className}`;
  const arrow = (
    <ArrowUpRight
      aria-hidden="true"
      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    />
  );

  if (/^https?:\/\//i.test(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={classes}
      >
        {label}
        {arrow}
      </a>
    );
  }

  return (
    <Link to={url} onClick={onNavigate} className={classes}>
      {label}
      {arrow}
    </Link>
  );
}
