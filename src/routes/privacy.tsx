import { createFileRoute } from "@tanstack/react-router";

import { Clause, LegalPage } from "@/components/site/LegalPage";
import { COMPANY, fullAddress } from "@/lib/company";
import deck from "@/assets/deck-sunset.jpg";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — MV Alaska Cruise" },
      {
        name: "description",
        content:
          "How MV Alaska Cruise collects, uses and protects your personal information, including payment security and our use of cookies.",
      },
    ],
  }),
});

function Privacy() {
  return (
    <LegalPage
      eyebrow="Your privacy"
      title={
        <>
          Privacy <em className="not-italic">policy.</em>
        </>
      }
      subtitle="What we collect when you book, why we need it, and what we do to keep it safe."
      image={deck}
      intro={
        <>
          {COMPANY.name} ({fullAddress(COMPANY.address)}) operates this website and the booking
          service on it. This policy explains what personal information we handle, why, and the
          choices you have. By booking with us you agree to what is described below.
        </>
      }
    >
      <Clause number="1" title="Information we collect">
        <p>We only ask for what a booking actually requires.</p>
        <ul>
          <li>
            <strong>Booking details</strong> — your name, mobile number and email address, the
            cabins you choose, and how many adults and children are travelling.
          </li>
          <li>
            <strong>Children&apos;s ages</strong> — needed because fares are age-based. We do not
            collect anything else about a child.
          </li>
          <li>
            <strong>Passport details of foreign nationals</strong> — passport number, nationality
            and expiry, where a guest is not a Bangladeshi national. This is required for the
            vessel&apos;s passenger manifest and for the authorities, and is never used for anything
            else.
          </li>
          <li>
            <strong>Special requests</strong> — anything you tell us voluntarily (dietary needs,
            accessibility, an anniversary).
          </li>
          <li>
            <strong>Refund details</strong> — if you cancel, the account you ask us to send the
            money to.
          </li>
          <li>
            <strong>Technical data</strong> — your IP address and basic browser information,
            recorded automatically so we can keep the site secure and working.
          </li>
        </ul>
      </Clause>

      <Clause number="2" title="Payment security">
        <p>
          <strong>We never see, handle or store your card or wallet details.</strong> Payments are
          processed by <strong>SSLCommerz</strong>, a Bangladesh Bank–approved payment gateway. When
          you pay, you are taken to SSLCommerz&apos;s own secure checkout, and your card number,
          PIN, OTP or bKash credentials are entered there — not on our website and not through our
          servers.
        </p>
        <p>
          All traffic to this site is encrypted with HTTPS/TLS. What comes back to us from the
          gateway is confined to what we need to run your booking: whether the payment succeeded,
          the amount, and a transaction reference. Every payment is verified directly with the
          gateway before a booking is marked paid, so a payment result cannot be forged by anyone in
          between.
        </p>
        <p>
          Your booking is reached by an unguessable booking code, and anything that moves money — a
          cancellation or a refund request — additionally asks for the last four digits of the phone
          number on the booking.
        </p>
      </Clause>

      <Clause number="3" title="How we use your information">
        <ul>
          <li>To create, confirm and manage your booking.</li>
          <li>
            To send you booking confirmations, invoices, payment reminders and cancellation or
            refund notices.
          </li>
          <li>
            To prepare the passenger list our crew uses on board, and the manifest required by the
            authorities.
          </li>
          <li>To answer your enquiries and provide customer support.</li>
          <li>To meet our legal, tax and accounting obligations, and to prevent fraud.</li>
        </ul>
        <p>
          We do not send marketing messages to people who have only made a booking, and{" "}
          <strong>we never sell or rent your personal information.</strong>
        </p>
      </Clause>

      <Clause number="4" title="Cookies">
        <p>
          A cookie is a small file a website stores in your browser. We keep our use of them
          deliberately narrow:
        </p>
        <ul>
          <li>
            <strong>Essential cookies and local storage</strong> — these keep your booking progress
            as you move through the steps, and keep staff signed in to the dashboard. The site
            cannot function without them.
          </li>
          <li>
            <strong>Payment gateway cookies</strong> — set by SSLCommerz during checkout, to carry
            your payment session securely.
          </li>
        </ul>
        <p>
          We do not use advertising or cross-site tracking cookies, and we do not build a profile of
          you across other websites. You can clear or block cookies in your browser settings; if you
          block the essential ones, booking will not work.
        </p>
      </Clause>

      <Clause number="5" title="Who we share it with">
        <p>We share your information only where a booking cannot happen without it:</p>
        <ul>
          <li>
            <strong>SSLCommerz</strong> — to take your payment and, where applicable, to process a
            refund.
          </li>
          <li>
            <strong>Our email provider</strong> — to deliver your confirmation and invoice.
          </li>
          <li>
            <strong>Our crew and guides</strong> — the passenger list for your sailing.
          </li>
          <li>
            <strong>Government authorities</strong> — where the law or maritime regulations require
            it, such as the passenger manifest.
          </li>
        </ul>
        <p>
          Files that contain personal data — your invoices in particular — are kept in private
          storage and served through links that expire, not from publicly guessable addresses.
        </p>
      </Clause>

      <Clause number="6" title="How long we keep it">
        <p>
          Booking, payment and invoice records are kept for as long as tax and accounting law
          requires. Enquiries and messages are kept only while they are useful for supporting you,
          and are then deleted.
        </p>
      </Clause>

      <Clause number="7" title="Your rights">
        <p>
          You may ask us for a copy of the information we hold about you, ask us to correct anything
          that is wrong, or ask us to delete what we are not legally required to keep. Contact us
          using the details below and we will respond as quickly as we can.
        </p>
      </Clause>

      <Clause number="8" title="Changes to this policy">
        <p>
          If we change this policy we will update the date at the top of this page. Material changes
          will be highlighted here.
        </p>
      </Clause>
    </LegalPage>
  );
}
