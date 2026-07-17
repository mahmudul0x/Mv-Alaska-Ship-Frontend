import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/cabins", label: "Cabins" },
  { to: "/packages", label: "Packages" },
  { to: "/wildlife", label: "Wildlife" },
  { to: "/dining", label: "Dining" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`container-luxe transition-all duration-500 ${
          scrolled
            ? "rounded-full glass-dark px-6 py-3 mx-4 md:mx-auto"
            : "px-2"
        }`}
        style={scrolled ? { maxWidth: "1200px" } : undefined}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="MV Alaska Cruise Ship" className="h-14 w-auto object-contain" />
            <div className="leading-none">
              <div className="font-display text-xl tracking-widest text-background font-bold">M.V. ALASKA</div>
              <div className="eyebrow text-gold-soft text-[10px] mt-0.5 tracking-[0.2em]">Cruise Ship</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-background/85 hover:text-gold transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-px after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-500"
                activeProps={{ className: "text-gold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+8801712823482"
              className="hidden xl:flex items-center gap-2 text-xs text-background/80 hover:text-gold transition-colors"
            >
              <Phone className="size-3.5" />
              +880 1712-823482
            </a>
            <Link
              to="/booking"
              className="px-5 py-2.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.18em] font-semibold hover-lift shadow-luxe"
            >
              Book Now
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden text-background p-2"
            aria-label="Menu"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden mt-3 mx-4 glass-dark rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-background/90 hover:text-gold border-b border-white/5 text-sm tracking-wide"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="mt-4 px-5 py-3 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.18em] font-semibold text-center"
            >
              Book Your Journey
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
