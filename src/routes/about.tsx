import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Stats } from "@/components/site/Stats";
import { CTA } from "@/components/site/CTA";
import deck from "@/assets/deck-sunset.jpg";
import canal from "@/assets/canal-mangrove.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About MV Alaska — Bangladesh's Most Luxurious Cruise" },
      { name: "description", content: "The story behind MV Alaska — the largest government-approved luxury cruise ship operating in the Sundarbans." },
    ],
  }),
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="The Brand"
        title={<>A floating <em className="not-italic text-gradient-gold">five-star</em> sanctuary.</>}
        subtitle="MV Alaska was conceived as Bangladesh's answer to the world's great river expedition vessels — uncompromising in comfort, devoted to the wild."
        image={deck}
      />

      <section className="py-28 md:py-36 bg-background">
        <div className="container-luxe grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Our Philosophy"
              title={<>Adventure, refined.</>}
            />
          </div>
          <div className="lg:col-span-7 space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              For too long, exploring the Sundarbans meant choosing between authentic wilderness and refined comfort. MV Alaska was built to end that compromise — a vessel where private balcony suites overlook tiger habitat, where master chefs serve fresh river catch on candlelit decks, and where every guest is accompanied by Bangladesh's most experienced naturalists and trained forest guards.
            </p>
            <p>
              We are government-licensed, internationally inspired, and proudly Bangladeshi. Whether you arrive as a couple, a family, a corporate retreat, or a private charter group, the standard never wavers.
            </p>
          </div>
        </div>
      </section>

      <Stats />

      <section className="py-28 md:py-36 gradient-ocean">
        <div className="container-luxe grid lg:grid-cols-2 gap-12 items-center">
          <img src={canal} alt="Mangrove canal" className="rounded-2xl shadow-luxe aspect-[4/3] object-cover" />
          <div className="text-background">
            <SectionHeader
              light
              eyebrow="Our Mission"
              title={<>To make the wild <em className="not-italic text-gradient-gold">accessible</em> — without diminishing it.</>}
              description="Sustainable cruising practices, low-impact mooring, and a deep partnership with the Forest Department keep the Sundarbans wild for the next generation."
            />
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
