import { createFileRoute } from "@tanstack/react-router";
import { Wildlife } from "@/components/site/Wildlife";
import { PageHero } from "@/components/site/PageHero";
import { CTA } from "@/components/site/CTA";
import tiger from "@/assets/wildlife-tiger.jpg";

export const Route = createFileRoute("/wildlife")({
  component: WildlifePage,
  head: () => ({
    meta: [
      { title: "Wildlife Experience — MV Alaska Sundarbans" },
      { name: "description", content: "Royal Bengal tigers, spotted deer, kingfishers and the world's largest mangrove ecosystem — experienced from a luxury cruise." },
    ],
  }),
});

function WildlifePage() {
  return (
    <>
      <PageHero
        eyebrow="The Wild"
        title={<>The <em className="not-italic">last great</em> mangrove on earth.</>}
        subtitle="Documentary-grade encounters with tigers, deer, crocodiles, and 300+ bird species — guided by Bangladesh's most experienced naturalists."
        image={tiger}
      />
      <Wildlife />
      <CTA />
    </>
  );
}
