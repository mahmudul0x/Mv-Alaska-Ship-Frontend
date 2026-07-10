import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import canal from "@/assets/canal-mangrove.jpg";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — MV Alaska Cruise Reservations" },
      { name: "description", content: "Reach our reservations team in Dhaka and Khulna. WhatsApp, phone, email — we respond within hours." },
    ],
  }),
});

function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Reservations"
        title={<>Let's plan your <em className="not-italic text-gradient-gold">voyage</em>.</>}
        subtitle="Our concierge team responds within hours, in English or Bangla."
        image={canal}
      />

      <section className="py-28 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <SectionHeader eyebrow="Get in touch" title={<>Speak to our <em className="not-italic text-gradient-gold">concierge</em>.</>} />

            <div className="space-y-6">
              {[
                { icon: Phone, label: "Phone", lines: ["+880 1831-694307", "+880 1550-699732", "+880 1712-786308", "+880 1712-823482"] },
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

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 bg-card p-8 md:p-12 rounded-2xl shadow-luxe space-y-5"
            onSubmit={(e) => { e.preventDefault(); alert("Thank you. Our concierge will respond shortly."); }}
          >
            <h3 className="font-display text-3xl font-normal">Inquiry</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" name="name" />
              <Field label="Email" name="email" type="email" />
              <Field label="Phone" name="phone" />
              <Field label="Departure date" name="date" type="date" />
            </div>
            <Field label="Number of guests" name="guests" type="number" />
            <div>
              <label className="eyebrow text-muted-foreground text-[10px] block mb-2">Message</label>
              <textarea name="message" rows={5} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
            </div>
            <button className="w-full md:w-auto px-10 py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-gold hover-lift">
              Send Inquiry
            </button>
          </motion.form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="eyebrow text-muted-foreground text-[10px] block mb-2">{label}</label>
      <input
        type={type}
        name={name}
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold"
      />
    </div>
  );
}
