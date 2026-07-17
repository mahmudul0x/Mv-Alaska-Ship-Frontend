import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="relative gradient-ocean text-background">
      <div className="gold-rule" />
      <div className="container-luxe py-20 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="MV Alaska Cruise Ship" className="h-20 w-auto object-contain" />
            <div className="leading-none">
              <div className="font-display text-3xl tracking-widest font-bold">M.V. ALASKA</div>
              <div className="eyebrow text-gold-soft text-[10px] mt-1 tracking-[0.2em]">Cruise Ship</div>
            </div>
          </div>
          <p className="mt-6 text-sm text-background/65 leading-relaxed max-w-sm">
            The premium brand for river cruising. Bangladesh's most luxurious
            government-approved Sundarbans cruise — where adventure meets elegance.
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
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container-luxe py-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-background/50">
          <div>© {new Date().getFullYear()} MV Alaska Cruise Ship. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/policy" className="hover:text-gold">Privacy</Link>
            <Link to="/policy" className="hover:text-gold">Terms</Link>
            <Link to="/" className="hover:text-gold">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
