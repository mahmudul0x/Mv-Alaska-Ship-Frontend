import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

import banner from "@/assets/sslcommerz-banner.webp";

/**
 * The official SSLCommerz "Pay With" banner, as supplied by the gateway.
 *
 * Publishing it is a condition of merchant activation, so the artwork itself —
 * the card tiles, the logos, the SSLCOMMERZ mark — is reproduced untouched.
 *
 * What changed is the ground it sits on. SSLCommerz ship several variants and
 * all of them are drawn for a white page: white tiles on a white field, with
 * "Pay With" and "Verified By" set in navy. On this footer that read as a
 * glaring slab, so the outer white was made transparent — flooded inward from
 * the edges, so the white *inside* each tile survives — and those two labels
 * and the two divider rules were lifted to white.
 *
 * This is the single-row variant, a 30:1 ribbon. It is far too wide to sit in
 * a column or to shrink to a phone, so it runs the full width of the window
 * and never renders narrower than 1700px, scrolling sideways instead — below
 * that the card marks stop being recognisable. The supplied 9561px PNG is
 * stored resampled to 3400px WebP with alpha.
 */
export function PaymentMethods({ className = "" }: { className?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  // Measured rather than guessed at a breakpoint: the width where this starts
  // to overflow depends on the banner, and a "swipe" hint shown when nothing
  // scrolls is worse than no hint at all.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`border-t border-white/8 ${className}`}
      aria-label="Accepted payment methods"
    >
      <div className="container-luxe pt-9 pb-3.5">
        <div className="flex items-baseline justify-between gap-4">
          <div className="eyebrow text-[10px] text-background/45">Accepted payment methods</div>
          {scrollable && (
            <div className="text-[10px] text-background/35 shrink-0">Swipe to see all →</div>
          )}
        </div>
      </div>

      {/* The ribbon breaks out of the footer's container and runs the full
          width of the window. At 30:1 every pixel of width is a third of a
          pixel of logo, and inside the 1400px container the card marks came
          out barely 20px across. The wording above and below stays in the
          container, aligned with the columns. */}
      <div ref={scroller} className="overflow-x-auto px-6 md:px-10">
        <img
          src={banner}
          // Named in full because this is the one place a customer can check
          // whether their bank or wallet is accepted, and a screen-reader user
          // gets nothing from "payment banner".
          alt="Pay with Visa, Mastercard, American Express, UnionPay, DBBL Nexus, bKash, Nagad, Rocket, Upay, TapPay, mobile wallets and bank cards — verified by SSLCommerz"
          width={3400}
          height={112}
          loading="lazy"
          decoding="async"
          className="w-full h-auto min-w-[1700px]"
        />
      </div>

      <div className="container-luxe pt-5 pb-9">
        <div className="flex items-center gap-2 text-[11px] text-background/55">
          <ShieldCheck aria-hidden="true" className="size-3.5 text-gold shrink-0" />
          Payments are processed by SSLCommerz over an encrypted connection. We never see or store
          your card details.
        </div>
      </div>
    </section>
  );
}
