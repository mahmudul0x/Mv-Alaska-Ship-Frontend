import { createFileRoute, Link } from "@tanstack/react-router";

import { Clause, LegalPage } from "@/components/site/LegalPage";
import { useCancellationPolicy } from "@/hooks/queries/useCancellation";
import deck from "@/assets/deck-sunset.jpg";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicy,
  head: () => ({
    meta: [
      { title: "Refund & Delivery Policy — MV Alaska Cruise" },
      {
        name: "description",
        content:
          "How to cancel an MV Alaska booking, what it costs, how long a refund takes, and what you receive after paying.",
      },
    ],
  }),
});

/** Fallback only — the live table comes from the API, which is also what the
 *  backend charges from. See the note in routes/policy.tsx. */
const FALLBACK_TIERS: [string, string, string][] = [
  ["3 weeks before departure", "5%", "15%"],
  ["2 weeks before departure", "15%", "20%"],
  ["1 week before departure", "35%", "25%"],
  ["3 days before departure", "50%", "50%"],
  ["48 hours before departure", "75%", "70%"],
  ["24 hours before departure", "90%", "90%"],
  ["Less than 24 hours before departure", "100%", "100%"],
];

const percent = (value: string) => `${Number.parseFloat(value)}%`;

function RefundPolicy() {
  const { data } = useCancellationPolicy();
  const tiers: [string, string, string][] = data?.tiers.length
    ? data.tiers.map((tier) => [
        tier.label,
        percent(tier.individual_percent),
        percent(tier.group_percent),
      ])
    : FALLBACK_TIERS;
  // Quoted to the customer as our payout promise; the dashboard flags a refund
  // that passes it, so the number here is one we actually hold ourselves to.
  const slaDays = data?.refund_sla_days ?? 14;

  return (
    <LegalPage
      eyebrow="Refunds & delivery"
      title={
        <>
          Refund &amp; delivery <em className="not-italic">policy.</em>
        </>
      }
      subtitle="What you receive after booking, how to cancel, what it costs, and when the money comes back."
      image={deck}
      intro={
        <>
          We would rather you knew exactly where you stand before you pay than discover it
          afterwards. This page states what a cancellation costs, how to request one, and how long a
          refund takes.
        </>
      }
    >
      <Clause number="1" title="What you receive, and when">
        <p>
          A cruise is a service, so there is nothing to ship. What is &ldquo;delivered&rdquo; is
          your reservation and the documents that prove it:
        </p>
        <ul>
          <li>
            <strong>Immediately</strong> — on completing the booking you are given your booking code
            on screen, and your cabin is held for you.
          </li>
          <li>
            <strong>Within a few minutes of payment</strong> — a confirmation email with a PDF
            invoice showing your cabins, guests, the amount paid and anything still due. If it has
            not arrived, check your spam folder, then contact us.
          </li>
          <li>
            <strong>Any time afterwards</strong> — you can reopen your booking and re-download your
            invoice from{" "}
            <Link to="/manage" className="text-gold-text underline underline-offset-2">
              Manage your booking
            </Link>{" "}
            using your booking code and the last four digits of your phone number.
          </li>
          <li>
            <strong>On the day</strong> — board at the announced departure point with your booking
            code and a photo ID for each adult guest. Foreign nationals should carry the passport
            used at booking.
          </li>
        </ul>
      </Clause>

      <Clause number="2" title="Paying for your booking">
        <p>
          A booking is confirmed with a deposit; the balance may be paid online at any time before
          departure, or in cash to our guide when you board. If you have chosen to pay a deposit
          only, the remaining balance is due by the deadline shown on your booking page. Payment is
          taken through SSLCommerz — we never handle your card or wallet details.
        </p>
      </Clause>

      <Clause number="3" title="How to cancel">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            Open{" "}
            <Link to="/manage" className="text-gold-text underline underline-offset-2">
              Manage your booking
            </Link>{" "}
            and enter your booking code and the last four digits of your phone number.
          </li>
          <li>
            Choose <strong>Cancel this booking</strong>. Before you confirm anything you are shown
            the exact cancellation charge and the exact refund due.
          </li>
          <li>Tell us the reason and where to send the refund — bKash, Nagad or a bank account.</li>
          <li>
            Submit. You will receive an acknowledgement email straight away, and{" "}
            <strong>your cabin stays reserved</strong> until our team reviews the request.
          </li>
          <li>
            We review every request, normally within one working day, and email you the decision
            either way.
          </li>
        </ol>
        <p>
          If you prefer, call our reservations desk and we will do it for you. The figures quoted to
          you are fixed at the moment you submit — they do not change while we are reviewing, even
          if a deadline passes in the meantime.
        </p>
      </Clause>

      <Clause number="4" title="Cancellation charges">
        <p>
          Charges are a percentage of the total booking amount, based on how close to departure you
          cancel.
        </p>
        <div className="rounded-xl border border-border overflow-hidden overflow-x-auto my-4">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="bg-muted/60 text-left">
                <th className="px-4 py-3 eyebrow text-[10px] text-muted-foreground font-semibold">
                  When cancelled
                </th>
                <th className="px-4 py-3 eyebrow text-[10px] text-muted-foreground font-semibold">
                  Individual
                </th>
                <th className="px-4 py-3 eyebrow text-[10px] text-muted-foreground font-semibold">
                  Group
                </th>
              </tr>
            </thead>
            <tbody>
              {tiers.map(([when, individual, group], i) => (
                <tr key={when} className={`border-t border-border ${i % 2 ? "bg-muted/25" : ""}`}>
                  <td className="px-4 py-3 text-foreground">{when}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{individual}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>A refund is never negative.</strong> If the cancellation charge comes to more than
          you have actually paid, we keep what was paid and bill you for nothing further.
        </p>
        <p>
          Once a departure has begun, online cancellation closes and no refund is due — please call
          us if something has gone wrong.
        </p>
      </Clause>

      <Clause number="5" title="When we cancel a departure">
        <p>
          If we cancel a sailing — bad weather, a technical problem with the vessel, or the total
          number of passengers falling below the minimum required —{" "}
          <strong>no cancellation charge applies and you are refunded in full</strong>, or you may
          move your booking to another departure. This is our decision, not yours, so you are never
          charged for it.
        </p>
      </Clause>

      <Clause number="6" title="How long a refund takes">
        <p>
          Once approved, refunds are sent within <strong>{slaDays} working days</strong> to the
          bKash, Nagad or bank account you gave us. We email you a confirmation with the transaction
          reference when the money goes out — quote it back to us if it has not reached you.
        </p>
        <p>
          Refunds are processed manually rather than reversed through the payment gateway, which is
          why we ask you where to send the money. Your provider may take a little additional time to
          post it to your account.
        </p>
      </Clause>

      <Clause number="7" title="Money paid by mistake">
        <p>
          If you are ever overcharged, or a payment is taken twice, the full amount is returned to
          you — the cancellation charges above do not apply, because that money was never ours.
          Contact us and we will settle it.
        </p>
      </Clause>
    </LegalPage>
  );
}
