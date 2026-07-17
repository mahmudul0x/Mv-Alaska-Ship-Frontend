import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { INQUIRY_TYPES, submitContactMessage, type InquiryType } from "@/lib/api/contact";
import type { ApiError } from "@/lib/api/types";
import canal from "@/assets/canal-mangrove.jpg";

// The reservations WhatsApp line — the "Send via WhatsApp" button opens a
// pre-filled chat to this number. Digits only, international format, no "+".
const WHATSAPP_NUMBER = "8801831694307";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — MV Alaska Cruise Reservations" },
      { name: "description", content: "Reach our reservations team in Dhaka and Khulna. WhatsApp, phone, email — we respond within hours." },
    ],
  }),
});

interface FormState {
  name: string;
  email: string;
  phone: string;
  inquiryType: InquiryType;
  date: string;
  guests: string;
  message: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  inquiryType: "general",
  date: "",
  guests: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email.trim() && !form.phone.trim()) {
      setError("Please give us an email or a phone number so we can reply.");
      return;
    }

    setStatus("sending");
    try {
      await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        inquiry_type: form.inquiryType,
        message: form.message.trim(),
        departure_date: form.date || undefined,
        guests: form.guests ? Number(form.guests) : undefined,
      });
      setStatus("sent");
      setForm(EMPTY);
    } catch (err) {
      const apiErr = err as ApiError;
      const firstFieldError = apiErr.fieldErrors
        ? Object.values(apiErr.fieldErrors)[0]?.[0]
        : undefined;
      setError(
        apiErr.detail ||
          firstFieldError ||
          "Something went wrong sending your inquiry. Please try again or WhatsApp us.",
      );
      setStatus("idle");
    }
  }

  // Build a pre-filled WhatsApp message from whatever the form has so far —
  // opens the chat with the text ready; the customer taps send inside WhatsApp.
  function whatsappHref() {
    const inquiryLabel = INQUIRY_TYPES.find((t) => t.value === form.inquiryType)?.label;
    const lines = [
      "Hello MV Alaska, I'd like to enquire about a cruise.",
      form.name && `Name: ${form.name}`,
      inquiryLabel && `Inquiry: ${inquiryLabel}`,
      form.date && `Departure: ${form.date}`,
      form.guests && `Guests: ${form.guests}`,
      form.message && `\n${form.message}`,
    ].filter(Boolean);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  return (
    <>
      <PageHero
        eyebrow="Reservations"
        title={<>Let's plan your <em className="not-italic">voyage</em>.</>}
        subtitle="Our concierge team responds within hours, in English or Bangla."
        image={canal}
      />

      <section className="py-28 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <SectionHeader eyebrow="Get in touch" title={<>Speak to our <em className="not-italic">concierge</em>.</>} />

            <div className="space-y-6">
              {[
                { icon: Phone, label: "Phone", lines: ["+880 1831-694307", "+880 1550-699732", "+880 1712-823482"] },
                { icon: Mail, label: "Email", lines: ["mvalaskacruise@gmail.com"] },
                { icon: MessageCircle, label: "WhatsApp", lines: ["+880 1831-694307"] },
                { icon: MapPin, label: "Dhaka Office", lines: ["13/A Planners Tower, Banglamotor, Dhaka"] },
                { icon: MapPin, label: "Khulna Office", lines: ["71, KDA Avenue, Khulna, Bangladesh"] },
              ].map((c) => (
                <div key={c.label} className="flex gap-4 pb-6 border-b border-border last:border-0">
                  <div className="size-11 rounded-full bg-secondary grid place-items-center shrink-0">
                    <c.icon className="size-4 text-gold" />
                  </div>
                  <div>
                    <div className="eyebrow text-muted-foreground text-[10px]">{c.label}</div>
                    {c.lines.map((l) => (
                      <div key={l} className="text-base mt-1">{l}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 bg-card p-8 md:p-12 rounded-2xl shadow-luxe"
          >
            {status === "sent" ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="size-14 text-gold mx-auto" />
                <h3 className="font-display text-3xl font-normal">Inquiry received</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Thank you. Our concierge team has your message and will respond shortly.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-xs uppercase tracking-[0.2em] font-semibold text-gold hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-display text-3xl font-normal">Inquiry</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} required />
                  <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} />
                  <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
                  <Field label="Departure date (optional)" type="date" value={form.date} onChange={(v) => update("date", v)} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Number of guests (optional)" type="number" value={form.guests} onChange={(v) => update("guests", v)} />
                  <div>
                    <label className="eyebrow text-muted-foreground text-[10px] block mb-2">
                      Inquiry type
                    </label>
                    <select
                      value={form.inquiryType}
                      onChange={(e) => update("inquiryType", e.target.value as InquiryType)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold"
                    >
                      {INQUIRY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      General, family trip, corporate / group trip, or full ship charter.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="eyebrow text-muted-foreground text-[10px] block mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    rows={5}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive" role="alert">{error}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-luxe hover-lift disabled:opacity-60"
                  >
                    {status === "sending" && <Loader2 className="size-4 animate-spin" />}
                    {status === "sending" ? "Sending…" : "Send Inquiry"}
                  </button>
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#25D366] text-white text-xs uppercase tracking-[0.2em] font-semibold shadow-luxe hover-lift"
                  >
                    <MessageCircle className="size-4" />
                    Send via WhatsApp
                  </a>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="eyebrow text-muted-foreground text-[10px] block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold"
      />
    </div>
  );
}
