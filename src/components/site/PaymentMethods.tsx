import { useEffect, useRef, useState } from "react";

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
 * This is the two-row variant, roughly 9:1. The single-row one was tried and
 * dropped: at 30:1 its height is so much a function of its width that even run
 * edge-to-edge the card marks came out around 33px, where this one reaches
 * 43px inside the footer's own container. So it stays in the container, lined
 * up with the columns above, and scrolls sideways below about 820px. The
 * supplied 5235px PNG is stored resampled to 2640px WebP with alpha.
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
      <div className="container-luxe py-6">
        {/* No heading: the artwork's own "Pay With" says it, and a second label
            saying the same thing above it cost a line of footer for nothing.
            The swipe hint only ever appears on a narrow screen, so on a laptop
            this row takes no height at all. */}
        {scrollable && (
          <div className="text-right text-[10px] text-background/35 mb-2">Swipe to see all →</div>
        )}

        {/* The -mx/px pair bleeds the scroll container into the gutters so the
            artwork can reach the edge on a phone without being clipped. */}
        <div ref={scroller} className="overflow-x-auto -mx-1 px-1">
          <img
            src={banner}
            // Named in full because this is the one place a customer can check
            // whether their bank or wallet is accepted, and a screen-reader
            // user gets nothing from "payment banner".
            alt="Pay with Visa, Mastercard, American Express, UnionPay, DBBL Nexus, bKash, Nagad, Rocket, Upay, TapPay, mobile wallets and bank cards — verified by SSLCommerz"
            width={2640}
            height={296}
            loading="lazy"
            decoding="async"
            className="w-full h-auto min-w-[820px]"
          />
        </div>
      </div>
    </section>
  );
}
