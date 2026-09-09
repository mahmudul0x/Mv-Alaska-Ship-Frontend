import { ShieldCheck } from "lucide-react";

import banner from "@/assets/sslcommerz-banner.webp";

/**
 * The official SSLCommerz "Pay With" banner, as supplied by the gateway.
 *
 * Publishing it in the footer is a condition of merchant activation, and the
 * artwork must not be redrawn or cropped — so this component is a frame around
 * their image rather than a design of our own.
 *
 * The supplied PNG is 5235×586 and 378KB, which no footer needs — it is
 * resampled to 2480px wide and stored as WebP (55KB) so it does not cost every
 * page a third of a megabyte. The artwork itself is untouched.
 *
 * That shape, roughly 9:1, drives every choice below: it
 * cannot share a column with anything, and below about 800px of width the
 * individual logos stop being recognisable. So it gets the full container and,
 * on a phone, scrolls sideways at a legible size instead of shrinking into a
 * grey smear.
 */
export function PaymentMethods({ className = "" }: { className?: string }) {
  return (
    <section
      className={`border-t border-white/8 ${className}`}
      aria-label="Accepted payment methods"
    >
      <div className="container-luxe py-9">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <div className="eyebrow text-[10px] text-background/50">Accepted payment methods</div>
          {/* The swipe hint exists only at the width where the banner actually
              overflows — a scroll affordance shown when nothing scrolls is
              just noise. */}
          <div className="text-[10px] text-background/35 sm:hidden">Swipe to see all →</div>
        </div>

        {/* White plate: the artwork's own background is white, so anything
            darker would show as a halo around the logos. */}
        <div className="rounded-xl bg-white ring-1 ring-white/10 p-2.5 sm:p-3.5 overflow-x-auto">
          <img
            src={banner}
            // Named in full because this is the one place a customer can check
            // whether their bank or wallet is accepted, and a screen-reader
            // user gets nothing from "payment banner".
            alt="Pay with Visa, Mastercard, American Express, UnionPay, DBBL Nexus, bKash, Nagad, Rocket, Upay, TapPay, mobile wallets and bank cards — verified by SSLCommerz"
            width={2480}
            height={278}
            loading="lazy"
            decoding="async"
            className="w-full h-auto min-w-[820px]"
          />
        </div>

        <div className="mt-3.5 flex items-center gap-2 text-[11px] text-background/55">
          <ShieldCheck aria-hidden="true" className="size-3.5 text-gold shrink-0" />
          Payments are processed by SSLCommerz over an encrypted connection. We never see or store
          your card details.
        </div>
      </div>
    </section>
  );
}
