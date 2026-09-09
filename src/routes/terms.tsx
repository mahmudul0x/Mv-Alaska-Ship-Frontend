import { createFileRoute, Link } from "@tanstack/react-router";

import { Clause, LegalPage } from "@/components/site/LegalPage";
import { COMPANY, fullAddress, registrationRows } from "@/lib/company";
import deck from "@/assets/deck-sunset.jpg";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MV Alaska Cruise" },
      {
        name: "description",
        content:
          "The terms on which MV Alaska Cruise sells and operates Sundarbans cruise packages booked through this website.",
      },
    ],
  }),
});

function Terms() {
  const registration = registrationRows();

  return (
    <LegalPage
      eyebrow="Terms & Conditions"
      title={
        <>
          Terms &amp; <em className="not-italic">conditions.</em>
        </>
      }
      subtitle="The agreement between you and us when you book a voyage through this website."
      image={deck}
      intro={
        <>
          Please read these terms before booking. By using this website or making a booking you
          agree to them. If you do not agree, please do not use the site.
        </>
      }
    >
      <Clause number="1" title="Who we are">
        <p>
          This website is operated by <strong>{COMPANY.name}</strong>
          {COMPANY.legalName !== "———" && <> (legally {COMPANY.legalName})</>}, of{" "}
          {fullAddress(COMPANY.address)}.
        </p>
        {registration.length > 0 && (
          <ul>
            {registration.map((row) => (
              <li key={row.label}>
                <strong>{row.label}</strong> {row.value}
              </li>
            ))}
          </ul>
        )}
        <p>
          &ldquo;We&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean {COMPANY.name}.
          &ldquo;You&rdquo; means anyone using this website or making a booking. A
          &ldquo;booking&rdquo; is a reservation for one or more cabins on a specified departure.
        </p>
      </Clause>

      <Clause number="2" title="Use of this website">
        <p>
          You may use this site to browse voyages and make genuine bookings. You agree not to
          interfere with the site or the service, attempt to access another customer&apos;s booking,
          or use automated tools to place bookings or extract data. Text, photographs and design on
          this site belong to us and may not be reused without permission.
        </p>
      </Clause>

      <Clause number="3" title="Bookings">
        <ul>
          <li>
            The information you give us must be accurate — particularly the lead guest&apos;s name
            and mobile number, which we use to reach you about your voyage.
          </li>
          <li>
            Each cabin has a maximum number of adults and children. These limits come from the cabin
            type and are enforced when you book.
          </li>
          <li>
            Children&apos;s fares depend on age. You must give each child&apos;s correct age; the
            fare is calculated from it.
          </li>
          <li>
            A booking is only confirmed once the required payment has been received and we have
            emailed your confirmation.
          </li>
          <li>
            Online booking for a departure closes automatically at{" "}
            <strong>12:00 PM (noon) on the day before the tour start date</strong>. After that,
            please contact our reservations desk.
          </li>
        </ul>
      </Clause>

      <Clause number="4" title="Prices and payment">
        <p>
          All prices are in Bangladeshi Taka (BDT). The fare shown at checkout is the total for your
          booking, calculated by us from the cabin, the number of guests and their ages, and any
          applicable foreign-national surcharge. Prices may change for future departures, but never
          for a booking already made.
        </p>
        <p>
          Payment is taken through <strong>SSLCommerz</strong>. You may pay in full, or pay a
          deposit and settle the balance before departure — online, or in cash to our guide on
          board. Any outstanding balance must be settled before or at boarding.
        </p>
      </Clause>

      <Clause number="5" title="Cancellations and refunds">
        <p>
          Cancellations, cancellation charges and refund timelines are set out in full in our{" "}
          <Link to="/refund-policy" className="text-gold-text underline underline-offset-2">
            Refund &amp; Delivery Policy
          </Link>
          , which forms part of these terms.
        </p>
      </Clause>

      <Clause number="6" title="Changes we may have to make">
        <p>
          Cruising depends on conditions we do not control. Where bad weather, a technical problem
          with the vessel, an instruction from the authorities, or the number of passengers falling
          below the minimum required makes a sailing unsafe or unviable, we may cancel, reschedule
          or alter the itinerary. If we cancel a departure you are refunded in full or moved to
          another sailing, at your choice. Minor changes to the route or the on-board programme do
          not entitle you to a refund.
        </p>
      </Clause>

      <Clause number="7" title="On board: your responsibilities">
        <ul>
          <li>
            Arrive at the announced departure point on time. We cannot delay a sailing for late
            guests, and a missed departure is treated as a no-show.
          </li>
          <li>
            Carry photo ID for each adult guest; foreign nationals should carry the passport used at
            booking.
          </li>
          <li>
            Follow the instructions of the captain, crew and guides at all times. They are
            responsible for your safety, and for the vessel.
          </li>
          <li>
            Behave considerately toward other guests. We may refuse boarding to, or disembark,
            anyone whose conduct endangers or seriously disturbs others, without refund.
          </li>
          <li>
            The Sundarbans is a protected reserve. Do not disturb wildlife or leave waste behind.
          </li>
        </ul>
      </Clause>

      <Clause number="8" title="Health, safety and insurance">
        <p>
          River cruising in a mangrove forest involves the ordinary risks of boats, water and remote
          locations. Please tell us in advance about any medical condition, mobility need or dietary
          requirement so we can prepare. We recommend travel insurance. Guests travel at their own
          risk in respect of pre-existing conditions.
        </p>
      </Clause>

      <Clause number="9" title="Your belongings">
        <p>
          Please look after your own valuables. We are not responsible for personal property lost,
          damaged or left behind on board, except where caused by our negligence.
        </p>
      </Clause>

      <Clause number="10" title="Liability">
        <p>
          We provide our services with reasonable care and skill. Our liability for any claim
          arising out of a booking is limited to the amount you paid for that booking, except where
          the law does not allow such a limit. We are not liable for losses caused by events beyond
          our reasonable control — weather, natural events, government action or restrictions on the
          waterways.
        </p>
      </Clause>

      <Clause number="11" title="Privacy">
        <p>
          How we handle your personal information, including payment security and cookies, is
          described in our{" "}
          <Link to="/privacy" className="text-gold-text underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </Clause>

      <Clause number="12" title="Governing law">
        <p>
          These terms are governed by the laws of Bangladesh, and any dispute is subject to the
          jurisdiction of the courts of Bangladesh.
        </p>
      </Clause>

      <Clause number="13" title="Changes to these terms">
        <p>
          We may update these terms from time to time. The version in force is the one published
          here on the date you make your booking; the date it was last revised is shown at the top
          of this page.
        </p>
      </Clause>
    </LegalPage>
  );
}
