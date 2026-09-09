import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Instagram, Facebook, Ticket, Youtube } from "lucide-react";
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
        </div>

        {/* Policies, not a second copy of the navbar. Every page listed here is
            already one click away in the header, whereas the policies are
            reachable from nowhere else — and the payment gateway's merchant
            review expects to find them in the footer. */}
        <div className="lg:col-span-2">
          <div className="eyebrow text-gold mb-5">Policies</div>
          <ul className="space-y-3 text-sm text-background/75">
            {[
              ["Terms & Conditions", "/terms"],
              ["Privacy Policy", "/privacy"],
              ["Refund & Delivery Policy", "/refund-policy"],
              ["Payment & Cancellation", "/policy"],
              ["Contact Us", "/contact"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link to={href} className="hover:text-gold transition-colors">
                  {label}
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
          {/* Kept from the old Explore list: this is the only route to it —
              it is deliberately absent from the navbar. */}
          <Link
            to="/manage"
            className="mt-5 inline-flex items-center gap-2 text-sm text-gold-soft hover:text-gold transition-colors border-b border-gold/30 hover:border-gold pb-1"
          >
            <Ticket className="size-4 shrink-0" />
            Manage your booking
          </Link>
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

          {/* Icon-only links carry no text, so each needs an explicit accessible
              name — without one a screen reader announces only "link". */}
          <div className="mt-7 flex gap-3">
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
      </div>

      {/* Its own band, directly under the columns rather than down at the
          copyright line. The gateway's banner is about 9:1, so it cannot live
          inside a column — at that width the card logos are a few pixels wide
          and the compliance requirement is met in name only. */}
      <PaymentMethods />

      {/* Registration identifiers the gateway's review expects published. The
          policy links moved up into their own column, so this strip is only
          the numbers now — and disappears entirely until they are filled in. */}
      {registration.length > 0 && (
        <div className="border-t border-white/8">
          <div className="container-luxe py-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-background/45">
            {registration.map((row) => (
              <span key={row.label}>
                {row.label} <strong className="text-background/65">{row.value}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

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
