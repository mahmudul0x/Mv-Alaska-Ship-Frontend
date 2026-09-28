import { motion } from "framer-motion";

import { usePromotionFor } from "@/hooks/queries/usePromotions";
import { SectionHeader } from "@/components/site/SectionHeader";
import { PromotionCta } from "@/components/site/PromotionModal";

/**
 * The promotion as a section of the home page.
 *
 * The third and least intrusive surface: it is simply part of the page, found
 * by someone scrolling rather than pushed at them. This is the one that still
 * works for the visitor who dismissed the modal, blocks storage, or arrived
 * from a deep link.
 *
 * Two layouts from one record: with artwork it is a split card, without it a
 * centred text panel. The fallback is deliberate — a promotion should never be
 * held up waiting for a designer, and a half-empty image slot looks worse than
 * no image at all.
 */
export function PromotionBanner() {
  const promotion = usePromotionFor("home_section");
  if (!promotion) return null;

  const hasImage = Boolean(promotion.image_url);

  return (
    <section className="px-4 py-14 sm:py-20">
      {/* The heading lives INSIDE the component, after the early return above,
          so there is never a titled section with nothing under it. A bare card
          in the middle of the page reads as a stray advert; named, it reads as
          part of the site. */}
      <div className="mx-auto mb-8 max-w-6xl">
        <SectionHeader
          eyebrow="◆ Limited Time"
          title={
            <>
              Current <em className="not-italic text-gradient-gold font-normal">Offer</em>
            </>
          }
          align="center"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-card shadow-luxe ring-1 ring-gold-soft/40"
      >
        <div className={hasImage ? "grid md:grid-cols-2" : ""}>
          {hasImage && (
            <img
              src={promotion.image_url!}
              alt=""
              // Decorative — the copy beside it says everything it says.
              // A fixed height on small screens stops a tall portrait upload
              // from pushing the text entirely below the fold.
              className="h-56 w-full object-cover md:h-full md:min-h-88"
            />
          )}

          <div
            className={`flex flex-col justify-center p-8 sm:p-10 ${
              hasImage ? "" : "mx-auto max-w-2xl text-center"
            }`}
          >
            {promotion.badge_label && (
              <span
                className={`inline-flex items-center self-start rounded-full gradient-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-midnight ${
                  hasImage ? "" : "self-center"
                }`}
              >
                {promotion.badge_label}
              </span>
            )}

            <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {promotion.title}
            </h2>

            {promotion.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">
                {promotion.subtitle}
              </p>
            )}

            {promotion.cta_label && promotion.cta_url && (
              <div className={`mt-7 ${hasImage ? "" : "flex justify-center"}`}>
                <PromotionCta
                  label={promotion.cta_label}
                  url={promotion.cta_url}
                  className="self-start"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
