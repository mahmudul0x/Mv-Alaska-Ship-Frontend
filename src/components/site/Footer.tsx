import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";
import { PaymentMethods } from "./PaymentMethods";
import { registrationRows } from "@/lib/company";

export function Footer() {
  // Registration identifiers the gateway's review expects to see published.
  // Empty ones are dropped, so a business without a BIN prints no blank row.
  const registration = registrationRows();

  return (
    <footer className="relative gradient-ocean text-background">
      <div className="gold-rule" />
      <div className="container-luxe py-20 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="MV Alaska Cruise Ship" className="h-20 w-auto object-contain" />
            <div className="leading-none">
              <div className="font-display text-3xl tracking-widest font-bold">M.V. ALASKA</div>
              <div className="eyebrow text-gold-soft text-[10px] mt-1 tracking-[0.2em]">
                Cruise Ship
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-background/65 leading-relaxed max-w-sm">
            The premium brand for river cruising. Bangladesh's most luxurious government-approved
            Sundarbans cruise — where adventure meets elegance.
          </p>
          {/* Icon-only links carry no text, so each needs an explicit accessible
              name — without one a screen reader announces only "link". */}
          <div className="mt-6 flex gap-3">
            {[
              {
                Icon: Facebook,
                href: "https://www.facebook.com/profile.php?id=100093297079777",
                label: "MV Alaska on Facebook",
              },
              { Icon: Instagram, href: "#", label: "MV Alaska on Instagram" },
              { Icon: Youtube, href: "#", label: "MV Alaska on YouTube" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="size-10 rounded-full border border-white/15 grid place-items-center hover:border-gold hover:text-gold transition-colors"
              >
                <Icon aria-hidden="true" className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="eyebrow text-gold mb-5">Explore</div>
          <ul className="space-y-3 text-sm text-background/75">
            {[
              ["About", "/about"],
              ["Cabins", "/cabins"],
              ["Packages", "/packages"],
              ["Wildlife", "/wildlife"],
              ["Dining", "/dining"],
              ["Gallery", "/gallery"],
              ["Policy", "/policy"],
              // Where a customer who has already booked comes back to: cabins,
              // dates, invoices and cancellation, from a booking code.
              ["Manage booking", "/manage"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link to={h} className="hover:text-gold transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="eyebrow text-gold mb-5">Reservations</div>
          <ul className="space-y-3 text-sm text-background/75">
            <li className="flex items-start gap-3">
              <Phone className="size-4 text-gold shrink-0 mt-0.5" />
              <div>
                <div>+880 1712-823482</div>
                <div>+880 1831-694307</div>
                <div>+880 1550-699732</div>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-gold" />
              mvalaskacruise@gmail.com
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="eyebrow text-gold mb-5">Offices</div>
          <ul className="space-y-4 text-sm text-background/75">
            <li className="flex items-start gap-3">
              <MapPin className="size-4 text-gold shrink-0 mt-0.5" />
              <span>13/A Planners Tower, Banglamotor, Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="size-4 text-gold shrink-0 mt-0.5" />
              <span>71, KDA Avenue, Khulna, Bangladesh</span>
            </li>
          </ul>

          {/* Sits here rather than in the strip below because the Offices
              column ends early and leaves an empty band the width of it — and
              because the accepted-methods banner is worth seeing before
              someone has scrolled to the very bottom. */}
          <PaymentMethods className="mt-8" />
        </div>
      </div>

      {/* Legal + payment strip. The payment gateway's merchant review requires
          every policy to be reachable from the footer and the accepted-methods
          banner to be shown, and both belong here anyway — this is where people
          look for them. */}
      <div className="border-t border-white/8">
        <div className="container-luxe py-8">
          <div>
            <div className="eyebrow text-[10px] text-background/50 mb-3">Policies</div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-background/75">
              <Link to="/terms" className="hover:text-gold transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link to="/privacy" className="hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund-policy" className="hover:text-gold transition-colors">
                Refund &amp; Delivery Policy
              </Link>
              <Link to="/policy" className="hover:text-gold transition-colors">
                Payment &amp; Cancellation
              </Link>
              <Link to="/contact" className="hover:text-gold transition-colors">
                Contact Us
              </Link>
            </div>

            {registration.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-background/45">
                {registration.map((row) => (
                  <span key={row.label}>
                    {row.label} <strong className="text-background/65">{row.value}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container-luxe py-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-background/50">
          <div>© {new Date().getFullYear()} MV Alaska Cruise Ship. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-gold">
              About Us
            </Link>
            <Link to="/packages" className="hover:text-gold">
              Packages
            </Link>
            <Link to="/manage" className="hover:text-gold">
              Manage Booking
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
