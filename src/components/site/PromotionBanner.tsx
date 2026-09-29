import { motion } from "framer-motion";

import { usePromotionsFor } from "@/hooks/queries/usePromotions";
import { SectionHeader } from "@/components/site/SectionHeader";
import { PromotionCta } from "@/components/site/PromotionModal";
import type { Promotion } from "@/lib/api/promotions";

/**
 * The promotions as a section of the home page.
 *
 * The least intrusive of the three surfaces: simply part of the page, found by
 * someone scrolling rather than pushed at them. This is the one that still
 * works for the visitor who dismissed the modal, closed the bar, blocks
 * storage, or arrived on a deep link.
 *
 * It is also the only surface that can show more than one. Three sailings can
 * each carry their own offer, and they are not alternatives to each other — a
 * visitor interested in the October departure is not served by being shown
 * only the one for December. The bar cycles and the modal picks one because
 * they have a line and a moment respectively; this has a page.
 */
export function PromotionBanner() {
  const promotions = usePromotionsFor("home_section");
  if (!promotions.length) return null;

  const many = promotions.length > 1;

  return (
    <section className="px-4 py-14 sm:py-20">
      {/* The heading lives INSIDE the component, after the early return above,
          so there is never a titled section with nothing under it. A bare card
          in the middle of the page reads as a stray advert; named, it reads as
          part of the site. */}
      <div className="mx-auto mb-10 max-w-6xl">
        <SectionHeader
          eyebrow="◆ Limited Time"
          title={
            many ? (
              <>
                Current <em className="not-italic text-gradient-gold font-normal">Offers</em>
              </>
            ) : (
              <>
                Current <em className="not-italic text-gradient-gold font-normal">Offer</em>
              </>
            )
          }
          align="center"
        />
      </div>

      {many ? (
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {promotions.map((promotion, i) => (
            <OfferCard key={promotion.id} promotion={promotion} index={i} />
          ))}
        </div>
      ) : (
        <FeatureCard promotion={promotions[0]} />
      )}
    </section>
  );
}

/** One offer, given the whole width.
 *
 *  Two layouts from one record: with artwork it is a split card, without it a
 *  centred text panel. The fallback is deliberate — a promotion should never be
 *  held up waiting for a designer, and a half-empty image slot looks worse than
 *  no image at all.
 */
function FeatureCard({ promotion }: { promotion: Promotion }) {
  const hasImage = Boolean(promotion.image_url);

  return (
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
            // Decorative — the copy beside it says everything it says. A fixed
            // height on small screens stops a tall portrait upload from pushing
            // the text entirely below the fold.
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
              className={`inline-flex items-center self-start rounded-full gradient-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-midnight ${
                hasImage ? "" : "self-center"
              }`}
            >
              {promotion.badge_label}
            </span>
          )}

          <h3 className="mt-4 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {promotion.title}
          </h3>

          {promotion.subtitle && (
            <p className="mt-3 text-lg text-muted-foreground">{promotion.subtitle}</p>
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
  );
}

/** One of several offers, in a grid.
 *
 *  Stacked layout rather than the split used for a single offer: side-by-side
 *  image and text at half width leaves neither enough room, and a row of cards
 *  only reads as a set if they share a shape.
 */
function OfferCard({ promotion, index }: { promotion: Promotion; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      // Each card follows the one before it rather than the whole row landing
      // at once, which reads as a list arriving instead of a block appearing.
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-luxe ring-1 ring-gold-soft/40 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {promotion.image_url ? (
        <div className="h-44 overflow-hidden">
          <img
            src={promotion.image_url}
            alt=""
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      ) : (
        // Keeps the card's proportions when one offer has artwork and another
        // does not, so the grid stays a grid.
        <div className="h-44 gradient-gold opacity-90" />
      )}

      <div className="flex flex-1 flex-col p-6">
        {promotion.badge_label && (
          <span className="inline-flex items-center self-start rounded-full gradient-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-midnight">
            {promotion.badge_label}
          </span>
        )}

        <h3 className="mt-3 font-display text-2xl leading-tight text-foreground">
          {promotion.title}
        </h3>

        {promotion.subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {promotion.subtitle}
          </p>
        )}

        {promotion.cta_label && promotion.cta_url && (
          // mt-auto pins every card's button to its own bottom edge, so a
          // shorter offer does not leave its button floating mid-card.
          <div className="mt-auto pt-6">
            <PromotionCta label={promotion.cta_label} url={promotion.cta_url} />
          </div>
        )}
      </div>
    </motion.article>
  );
}
