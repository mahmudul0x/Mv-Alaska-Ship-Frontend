import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";

import { PageHero } from "./PageHero";
import { COMPANY, fullAddress } from "@/lib/company";

/**
 * Shared shell for the legal documents (terms, privacy, refund).
 *
 * They are read the way legal text is read — scanned for one clause — so the
 * three of them share a numbering scheme, a "last updated" date, and a contact
 * block at the end. A customer who cannot find the answer must always be one
 * line away from a human.
 */
export function LegalPage({
  eyebrow,
  title,
  subtitle,
  image,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} image={image} />

      <section className="py-20 md:py-24 bg-background">
        <div className="container-luxe max-w-3xl">
          <div className="text-xs text-muted-foreground mb-8 pb-6 border-b border-border">
            Last updated: <strong>{COMPANY.policiesUpdated}</strong>
            <span className="mx-2">·</span>
            Operated by {COMPANY.name}, {fullAddress(COMPANY.address)}
          </div>

          {intro && (
            <div className="text-base text-muted-foreground leading-relaxed mb-10">{intro}</div>
          )}

          <div className="space-y-10">{children}</div>

          {/* Every policy ends the same way: who to ask. */}
          <div className="mt-14 rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="eyebrow text-gold-text text-[10px] mb-3">
              Questions about this policy?
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Contact our reservations desk — we answer every message.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              {COMPANY.support.emails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 hover:text-gold-text transition-colors"
                >
                  <Mail className="size-4 text-gold shrink-0" />
                  {email}
                </a>
              ))}
              {COMPANY.support.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 hover:text-gold-text transition-colors"
                >
                  <Phone className="size-4 text-gold shrink-0" />
                  {phone}
                </a>
              ))}
            </div>
            <Link
              to="/contact"
              className="inline-block mt-5 text-xs uppercase tracking-[0.16em] text-gold-text font-semibold border-b border-gold/40 hover:border-gold pb-1"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/** One numbered clause. */
export function Clause({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl md:text-2xl font-light leading-tight">
        <span className="text-gold-text mr-2">{number}.</span>
        {title}
      </h2>
      <div className="mt-3 text-sm text-muted-foreground leading-relaxed space-y-3 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
