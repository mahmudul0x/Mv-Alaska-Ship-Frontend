import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { WhyChoose } from "@/components/site/WhyChoose";
import { Experience } from "@/components/site/Experience";
import { Wildlife } from "@/components/site/Wildlife";
import { Packages } from "@/components/site/Packages";
import { Stats } from "@/components/site/Stats";
import { UpcomingDepartures } from "@/components/site/UpcomingDepartures";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { PromotionModal } from "@/components/site/PromotionModal";
import { PromotionBanner } from "@/components/site/PromotionBanner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MV Alaska Cruise Ship — Luxury Sundarbans Cruise Bangladesh" },
      {
        name: "description",
        content:
          "Bangladesh's most luxurious government-approved Sundarbans cruise. Private balcony suites, BBQ deck nights, expert naturalists. Reserve your voyage with MV Alaska.",
      },
    ],
  }),
});

function Index() {
  return (
    <>
      {/* Opens by itself after a short delay, and only if this visitor has not
          already dismissed this version of it. Renders nothing when no
          promotion is live. */}
      <PromotionModal />
      <Hero />
      {/* High on the page, directly after the departures a visitor came to
          see — an offer buried under the testimonials is one nobody reads. */}
      <PromotionBanner />
      <UpcomingDepartures />
      <Stats />
      <WhyChoose />
      <Experience />
      <Wildlife />
      <Packages />
      <Testimonials />
      <CTA />
    </>
  );
}
