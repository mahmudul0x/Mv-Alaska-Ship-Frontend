import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { WhyChoose } from "@/components/site/WhyChoose";
import { Experience } from "@/components/site/Experience";
import { Wildlife } from "@/components/site/Wildlife";
import { Packages } from "@/components/site/Packages";
import { Stats } from "@/components/site/Stats";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";

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
      <Hero />
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
