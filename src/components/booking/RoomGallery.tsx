import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { RoomImage } from "@/lib/api/types";

type Props = {
  images: RoomImage[];
  roomNumber: string;
  /** "strip": scrollable row of every photo. "thumb": one small tile with a +N badge. */
  variant?: "strip" | "thumb";
  className?: string;
};

/** Photos of the selected room — thumbnails that open a full-size lightbox. */
export function RoomGallery({ images, roomNumber, variant = "strip", className = "" }: Props) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const close = useCallback(() => setOpenAt(null), []);
  const navigate = useCallback(
    (delta: number) =>
      setOpenAt((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  if (!images.length) return null;

  return (
    <>
      {variant === "strip" ? (
        <div
          className={`flex gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden ${className}`}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpenAt(i)}
              aria-label={`View photo ${i + 1} of ${images.length}, room ${roomNumber}`}
              className="group relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 ring-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean"
            >
              <img
                src={img.image}
                alt={img.caption || `Room ${roomNumber} photo ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpenAt(0)}
          aria-label={`View ${images.length} photo${images.length > 1 ? "s" : ""} of room ${roomNumber}`}
          className={`relative h-10 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 ring-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean ${className}`}
        >
          <img src={images[0].image} alt="" className="h-full w-full object-cover" />
          {images.length > 1 && (
            <span className="absolute bottom-0.5 right-0.5 rounded bg-ocean/85 px-1 py-px text-[8px] font-semibold leading-none text-background">
              +{images.length - 1}
            </span>
          )}
        </button>
      )}

      <AnimatePresence>
        {openAt !== null && (
          <Lightbox
            images={images}
            roomNumber={roomNumber}
            index={openAt}
            onClose={close}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Lightbox({
  images,
  roomNumber,
  index,
  onClose,
  onNavigate,
}: {
  images: RoomImage[];
  roomNumber: string;
  index: number;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}) {
  const img = images[index];
  const many = images.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNavigate(1);
      else if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", onKey);
    // The page must not scroll behind the overlay.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onNavigate]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Photos of room ${roomNumber}`}
      className="fixed inset-0 z-100 grid place-items-center bg-midnight/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* stopPropagation: clicks on the photo/controls must not fall through to
          the backdrop's close handler. */}
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img
          key={img.id}
          src={img.image}
          alt={img.caption || `Room ${roomNumber} photo ${index + 1}`}
          className="mx-auto max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-luxe"
        />
        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-background/80">
          <span className="font-medium">Room {roomNumber}</span>
          {img.caption && (
            <>
              <span className="size-1 rounded-full bg-background/40" />
              <span className="truncate">{img.caption}</span>
            </>
          )}
          {many && (
            <>
              <span className="size-1 rounded-full bg-background/40" />
              <span className="tabular-nums">
                {index + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute right-4 top-4 grid size-11 cursor-pointer place-items-center rounded-full bg-background/10 text-background ring-1 ring-background/25 transition-colors hover:bg-background/20"
      >
        <X className="size-5" />
      </button>

      {many && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-background/10 text-background ring-1 ring-background/25 transition-colors hover:bg-background/20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(1);
            }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-background/10 text-background ring-1 ring-background/25 transition-colors hover:bg-background/20"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </motion.div>,
    document.body,
  );
}
