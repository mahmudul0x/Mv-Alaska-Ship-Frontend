import { useState } from "react";
import { ShieldCheck } from "lucide-react";

/** The official SSLCommerz banner showing every accepted card and wallet.
 *
 *  Served from public/ rather than imported: a static import is resolved at
 *  build time, so a missing file fails the build. Download the banner from the
 *  SSLCommerz merchant panel and save it here — until then the text fallback
 *  below still satisfies a reader, and nothing breaks.
 */
const BANNER = "/sslcommerz-banner.png";

const METHODS = "Visa · Mastercard · AMEX · bKash · Nagad · Rocket · Upay · Internet banking";

/**
 * Accepted payment methods, for the footer and the checkout.
 *
 * Required by the payment gateway's merchant review, and worth having anyway:
 * a customer about to enter card details on an unfamiliar site is reassured by
 * seeing who is handling the money.
 */
export function PaymentMethods({ className = "" }: { className?: string }) {
  const [bannerFailed, setBannerFailed] = useState(false);

  return (
    <div className={className}>
      <div className="eyebrow text-[10px] text-background/50 mb-3">We accept</div>

      {!bannerFailed ? (
        <img
          src={BANNER}
          alt="Accepted payment methods — powered by SSLCommerz"
          loading="lazy"
          onError={() => setBannerFailed(true)}
          className="w-full rounded-lg bg-background/95 p-2"
        />
      ) : (
        // Banner not added yet. Say the same thing in words rather than leaving
        // a broken tile where the compliance requirement is.
        <div className="rounded-lg bg-background/95 px-4 py-3 text-ocean">
          <div className="text-[11px] font-semibold leading-relaxed break-words">{METHODS}</div>
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 text-[11px] text-background/55 leading-relaxed">
        <ShieldCheck className="size-3.5 text-gold shrink-0 mt-0.5" />
        Payments secured by SSLCommerz. We never see or store your card details.
      </div>
    </div>
  );
}
