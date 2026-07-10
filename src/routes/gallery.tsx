import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHero } from "@/components/site/PageHero";
import hero from "@/assets/hero-cruise.jpg";
import deck from "@/assets/deck-sunset.jpg";
import cabin from "@/assets/cabin-luxury.jpg";
import dining from "@/assets/dining-bbq.jpg";
import tiger from "@/assets/wildlife-tiger.jpg";
import deer from "@/assets/wildlife-deer.jpg";
import bird from "@/assets/wildlife-bird.jpg";
import canal from "@/assets/canal-mangrove.jpg";
import img104 from "@/assets/104.jpeg";
import img105 from "@/assets/105.jpeg";
import img108 from "@/assets/108.jpeg";

export const Route = createFileRoute("/gallery")({
  component: Gallery,
  head: () => ({
    meta: [
      { title: "Gallery — MV Alaska Cruise Photography" },
      { name: "description", content: "Cinematic photography from MV Alaska's Sundarbans expeditions — wildlife, vessel, dining, and landscape." },
    ],
  }),
});

const images = [
  { src: hero,    span: "md:col-span-2 md:row-span-2" },
  { src: cabin,   span: "" },
  { src: tiger,   span: "" },
  { src: img104,  span: "md:col-span-2" },
  { src: dining,  span: "" },
  { src: deer,    span: "" },
  { src: canal,   span: "md:col-span-2 md:row-span-2" },
  { src: img105,  span: "" },
  { src: img108,  span: "" },
  { src: deck,    span: "md:col-span-2" },
  { src: bird,    span: "" },
];

function Gallery() {
  return (
    <>
      <PageHero
        eyebrow="The Gallery"
        title={<>Stories the <em className="not-italic text-gradient-gold">camera</em> remembered.</>}
        subtitle="A cinematic archive from voyages aboard MV Alaska."
        image={canal}
      />
      <section className="py-20 bg-background">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[260px] gap-3">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.05 }}
              className={`group relative overflow-hidden rounded-xl ${img.span}`}
            >
              <img src={img.src} alt="" loading="lazy" className="image-zoom absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ocean/0 group-hover:bg-ocean/30 transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
