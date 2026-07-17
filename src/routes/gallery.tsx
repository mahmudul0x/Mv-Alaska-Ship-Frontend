import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { getGalleryImages } from "@/lib/api/gallery";
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

// Fallback set shown until staff upload photos from the dashboard.
const FALLBACK = [hero, cabin, tiger, img104, dining, deer, canal, img105, img108, deck, bird].map(
  (src) => ({ src, caption: "" }),
);

// Repeating mosaic rhythm — big anchor, singles, a wide, then again — so any
// number of staff-uploaded photos lays out well.
const SPANS = [
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "md:col-span-2",
  "",
  "",
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "md:col-span-2",
  "",
];

function Gallery() {
  const galleryQuery = useQuery({ queryKey: ["gallery"], queryFn: getGalleryImages });

  // Staff-managed photos when there are any; the built-in set otherwise, so
  // the page never renders empty while the dashboard gallery is being filled.
  const images =
    galleryQuery.data && galleryQuery.data.length > 0
      ? galleryQuery.data.map((img) => ({ src: img.image, caption: img.caption }))
      : FALLBACK;

  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <PageHero
        eyebrow="The Gallery"
        title={<>Stories the <em className="not-italic">camera</em> remembered.</>}
        subtitle="A cinematic archive from voyages aboard MV Alaska."
        image={canal}
      />
      <section className="py-20 bg-background">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[260px] gap-3">
          {images.map((img, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.05 }}
              className={`group relative overflow-hidden rounded-xl cursor-zoom-in ${SPANS[i % SPANS.length]}`}
              onClick={() => setLightbox(i)}
            >
              <img src={img.src} alt={img.caption} loading="lazy" className="image-zoom absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ocean/0 group-hover:bg-ocean/30 transition-colors" />
              {img.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-midnight/80 via-midnight/40 to-transparent px-3 pb-2.5 pt-8">
                  <span className="text-background text-xs md:text-sm font-medium leading-snug drop-shadow">
                    {img.caption}
                  </span>
                </figcaption>
              )}
            </motion.figure>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            images={images}
            index={lightbox}
            onNavigate={setLightbox}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Full-screen viewer: click a photo to open, arrows/swipe-keys to move ── */

function Lightbox({
  images,
  index,
  onNavigate,
  onClose,
}: {
  images: { src: string; caption: string }[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const count = images.length;
  const prev = useCallback(
    () => onNavigate((index - 1 + count) % count),
    [onNavigate, index, count],
  );
  const next = useCallback(
    () => onNavigate((index + 1) % count),
    [onNavigate, index, count],
  );

  // Keyboard: ← → navigate, Esc closes. Body scroll is locked while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [prev, next, onClose]);

  const image = images[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-100 bg-midnight/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 size-10 grid place-items-center rounded-full bg-white/10 text-background hover:bg-white/20 transition-colors"
      >
        <X className="size-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-5 z-10 text-background/70 text-xs tracking-[0.2em] uppercase">
        {index + 1} / {count}
      </div>

      {/* Prev / Next */}
      {count > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-2 md:left-6 z-10 size-11 md:size-12 grid place-items-center rounded-full bg-white/10 text-background hover:bg-gold hover:text-ocean transition-colors"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-2 md:right-6 z-10 size-11 md:size-12 grid place-items-center rounded-full bg-white/10 text-background hover:bg-gold hover:text-ocean transition-colors"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      {/* Image + caption — clicking the photo itself doesn't close */}
      <figure
        className="max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={image.src}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={image.src}
          alt={image.caption}
          className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl select-none"
          draggable={false}
        />
        {image.caption && (
          <figcaption className="text-background/90 text-sm md:text-base text-center max-w-2xl leading-snug">
            {image.caption}
          </figcaption>
        )}
      </figure>
    </motion.div>
  );
}
