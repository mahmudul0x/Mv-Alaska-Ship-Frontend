import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Banknote, CalendarX, ReceiptText, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import deck from "@/assets/deck-sunset.jpg";

export const Route = createFileRoute("/policy")({
  component: Policy,
  head: () => ({
    meta: [
      { title: "Payment & Cancellation Policy — MV Alaska Cruise" },
      {
        name: "description",
        content:
          "Booking confirmation, payment and cancellation terms for MV Alaska Sundarbans cruise packages.",
      },
    ],
  }),
});

const CANCELLATION_TIERS: [string, string, string][] = [
  ["3 weeks before departure", "5%", "15%"],
  ["2 weeks before departure", "15%", "20%"],
  ["1 week before departure", "35%", "25%"],
  ["3 days before departure", "50%", "50%"],
  ["48 hours before departure", "75%", "70%"],
  ["24 hours before departure", "90%", "90%"],
  ["Less than 24 hours before departure", "100%", "100%"],
];

function Policy() {
  return (
    <>
      <PageHero
        eyebrow="Terms & Conditions"
        title={
          <>
            Payment &{" "}
            <em className="not-italic text-gradient-gold">cancellation</em> policy.
          </>
        }
        subtitle="Clear, fair terms — so the only surprises on your voyage are the ones the Sundarbans provides."
        image={deck}
      />

      {/* ── Payment policy ── */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-14">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Payment Policy"
              title={<>Confirming your booking.</>}
            />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-border bg-card shadow-luxe p-7 flex gap-5">
              <div className="size-11 rounded-xl gradient-gold grid place-items-center shrink-0">
                <Banknote className="size-5 text-ocean" />
              </div>
              <div>
                <div className="font-display text-xl mb-2">50% advance to confirm</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To confirm your booking, pay at least <strong>50% of the total price</strong> in
                  advance. The remaining balance can be settled any time{" "}
                  <strong>before the journey</strong> — pay the full amount up front, clear the due
                  later from your booking page, or pay it to our guide when you board. Your cabin
                  stays reserved for you.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card shadow-luxe p-7 flex gap-5">
              <div className="size-11 rounded-xl gradient-gold grid place-items-center shrink-0">
                <ShieldCheck className="size-5 text-ocean" />
              </div>
              <div>
                <div className="font-display text-xl mb-2">Secure online payment</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All payments are processed securely through <strong>SSLCommerz</strong> — bKash,
                  cards, mobile and internet banking. An official invoice is emailed to you
                  automatically after every successful payment.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card shadow-luxe p-7 flex gap-5">
              <div className="size-11 rounded-xl gradient-gold grid place-items-center shrink-0">
                <ReceiptText className="size-5 text-ocean" />
              </div>
              <div>
                <div className="font-display text-xl mb-2">VAT, tax & government fees</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All prices are <strong>exclusive of VAT &amp; TAX</strong>. Additional government
                  revenue charges apply for foreign guests. Terms may be revised by management
                  decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cancellation table ── */}
      <section className="py-24 md:py-32 gradient-ocean">
        <div className="container-luxe">
          <div className="max-w-2xl mb-14">
            <SectionHeader
              light
              eyebrow="Cancellation Policy"
              title={
                <>
                  If plans <em className="not-italic text-gradient-gold">change</em>.
                </>
              }
              description="Cancellation charges are deducted from the total booking amount, based on how close to departure you cancel."
            />
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-luxe overflow-x-auto">
            <table className="w-full text-sm text-background min-w-[560px]">
              <thead>
                <tr className="bg-white/8 text-left">
                  <th className="px-6 py-4 eyebrow text-gold text-[10px] font-semibold">
                    When cancelled
                  </th>
                  <th className="px-6 py-4 eyebrow text-gold text-[10px] font-semibold">
                    Individual booking
                  </th>
                  <th className="px-6 py-4 eyebrow text-gold text-[10px] font-semibold">
                    Group booking
                  </th>
                </tr>
              </thead>
              <tbody>
                {CANCELLATION_TIERS.map(([when, individual, group], i) => (
                  <tr
                    key={when}
                    className={`border-t border-white/8 ${i % 2 ? "bg-white/3" : ""}`}
                  >
                    <td className="px-6 py-3.5">{when}</td>
                    <td className="px-6 py-3.5 font-semibold">{individual}</td>
                    <td className="px-6 py-3.5 font-semibold">{group}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-background/60">
            Percentages are deducted from the total booking amount.
          </p>
        </div>
      </section>

      {/* ── Operational notes ── */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-14">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Please Note"
              title={<>Weather & operations.</>}
            />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-border bg-card shadow-luxe p-7 flex gap-5">
              <div className="size-11 rounded-xl gradient-gold grid place-items-center shrink-0">
                <AlertTriangle className="size-5 text-ocean" />
              </div>
              <div>
                <div className="font-display text-xl mb-2">Tour changes beyond our control</div>
                <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-2">
                  <li>Bad weather conditions or a technical problem with the ship, or</li>
                  <li>total number of passengers falling below 30 pax —</li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  in these circumstances the tour may be <strong>cancelled, rescheduled or
                  refunded</strong> upon discussion with the guest.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card shadow-luxe p-7 flex gap-5">
              <div className="size-11 rounded-xl gradient-gold grid place-items-center shrink-0">
                <CalendarX className="size-5 text-ocean" />
              </div>
              <div>
                <div className="font-display text-xl mb-2">Booking deadline</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Online booking for each departure closes automatically at{" "}
                  <strong>12:00 PM (noon) the day before the tour start date</strong>. After the
                  deadline, please contact our reservation desk directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-28 bg-background">
        <div className="container-luxe text-center">
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-gold hover-lift"
          >
            Book Your Voyage <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
