import { ShieldCheck } from "lucide-react";

import banner from "@/assets/sslcommerz-banner.webp";

/**
 * The official SSLCommerz "Pay With" banner, as supplied by the gateway.
 *
 * Publishing it is a condition of merchant activation, so the artwork itself —
 * the card tiles, the logos, the SSLCOMMERZ mark — is reproduced untouched.
 *
 * What changed is the ground it sits on. The supplied file is the
 * light-background variant: white tiles on a white field, with "Pay With" and
 * "Verified By" set in navy. Dropped on this footer it read as a glaring white
 * slab, so the outer white was made transparent and those two labels and the
 * two divider rules were lifted to white — which is what SSLCommerz's own
 * dark-background variant looks like. If the client forwards that variant from
 * the onboarding email, it drops straight in here.
 *
 * It also arrived as a 378KB PNG for a slot never wider than about 1240px; it
 * is stored resampled to 2480px WebP with alpha, at 89KB.
 *
 * The 9:1 shape drives the layout: it cannot share a column with anything, and
 * below about 800px of width the individual logos stop being recognisable — so
 * it takes the full container and, on a phone, scrolls sideways at a legible
 * size instead of shrinking into a smear.
 */
export function PaymentMethods({ className = "" }: { className?: string }) {
  return (
    <section
      className={`border-t border-white/8 ${className}`}
      aria-label="Accepted payment methods"
    >
      <div className="container-luxe py-10">
        {/* The hint exists only at the width where the banner actually
            overflows — a scroll affordance shown when nothing scrolls is just
            noise. */}
        <div className="text-right text-[10px] text-background/35 mb-2 sm:hidden">
          Swipe to see all →
        </div>

        {/* The -mx/px pair lets the artwork run out to the gutters on a phone
            without the scroll container clipping its edge. */}
        <div className="overflow-x-auto -mx-1 px-1">
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

        <div className="mt-5 flex items-center gap-2 text-[11px] text-background/55">
          <ShieldCheck aria-hidden="true" className="size-3.5 text-gold shrink-0" />
          Payments are processed by SSLCommerz over an encrypted connection. We never see or store
          your card details.
        </div>
      </div>
    </section>
  );
}
