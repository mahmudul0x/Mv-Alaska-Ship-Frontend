import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { Expand, Info, Users, X } from "lucide-react";

import { ImageLightbox, RoomGallery } from "@/components/booking/RoomGallery";
import { formatBDT } from "@/lib/money";
import type { PackageRoom, RoomAvailability } from "@/lib/api/types";

const AVAILABILITY: Record<RoomAvailability, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-100 text-emerald-700" },
  booked: { label: "Booked", className: "bg-red-100 text-red-700" },
  unavailable: { label: "Unavailable", className: "bg-red-100 text-red-700" },
};

const CARD_WIDTH = 264;
const GAP = 10;
/** Keep the card off the very edge of the window on small screens. */
const MARGIN = 8;

type Props = {
  room: PackageRoom;
  /** The deck-plan tile this belongs to. Position is read from it. */
  anchor: DOMRect;
  /** Mobile opens it as a dismissible sheet with a gallery; desktop hover
   *  shows a static card that follows the mouse away. */
  interactive?: boolean;
  onClose?: () => void;
  /** The pointer travelling from the tile onto the card must not dismiss it —
   *  the photos are only clickable if the card can be reached. */
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** Held open while the full-screen viewer is up: the viewer covers the
   *  screen, so the pointer necessarily leaves the card, and closing on that
   *  would unmount the very photo being looked at. */
  onLockChange?: (locked: boolean) => void;
};

/**
 * The preview shown when a cabin on the deck plan is hovered (or tapped, on
 * touch). Photos plus the facts that decide a booking: who fits, what it costs,
 * whether it is free.
 *
 * Rendered through a portal to document.body. The deck plan sits inside bounded,
 * scrollable, transformed containers, and anything positioned within them is
 * clipped by the plan's own edges and trapped under the site's fixed navbar —
 * no z-index inside can escape a parent stacking context. Positioning is
 * therefore computed from the tile's viewport rect and flipped/clamped to stay
 * on screen.
 */
export function RoomPreviewCard({
  room,
  anchor,
  interactive = false,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onLockChange,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);

  function openLightbox(index: number) {
    setLightboxAt(index);
    onLockChange?.(true);
  }

  function closeLightbox() {
    setLightboxAt(null);
    onLockChange?.(false);
  }

  // Measured after paint: the card's height depends on how many photos it got,
  // so "does it fit below?" cannot be answered before it exists.
  useLayoutEffect(() => {
    const height = cardRef.current?.offsetHeight ?? 0;
    const belowFits = anchor.bottom + GAP + height <= window.innerHeight - MARGIN;
    const top = belowFits ? anchor.bottom + GAP : anchor.top - GAP - height;
    const left = anchor.left + anchor.width / 2 - CARD_WIDTH / 2;
    setPosition({
      top: Math.max(MARGIN, top),
      left: Math.min(Math.max(MARGIN, left), window.innerWidth - CARD_WIDTH - MARGIN),
    });
  }, [anchor]);

  useEffect(() => {
    if (!interactive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interactive, onClose]);

  const images = room.preview_images;
  const status = AVAILABILITY[room.availability];
  const { max_adults: adults, max_kids: kids } = room.room_type;

  const card = (
    <div
      ref={cardRef}
      role="tooltip"
      style={{
        width: CARD_WIDTH,
        // Hidden until measured, so it never flashes at the wrong spot.
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        visibility: position ? "visible" : "hidden",
      }}
      className="fixed z-100 rounded-xl border border-border bg-card shadow-luxe overflow-hidden text-left"
      onClick={(event) => event.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {images.length > 0 && (
        <div className="relative">
          {interactive ? (
            // Tapped open on touch: the thumbnails lead to the full-size
            // lightbox, which is the only way to actually look at a cabin
            // without a mouse.
            <RoomGallery
              images={images}
              roomNumber={room.room_number}
              variant="strip"
              className="p-2"
            />
          ) : (
            <div
              className={`grid gap-px bg-border ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {images.slice(0, 4).map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => openLightbox(index)}
                  aria-label={`View photo ${index + 1} of ${images.length} full size`}
                  className="group relative aspect-4/3 bg-muted cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ocean"
                >
                  <img
                    src={image.thumbnail_url || image.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {index === 3 && images.length > 4 ? (
                    <span className="absolute inset-0 grid place-items-center bg-midnight/60 text-background text-sm font-semibold">
                      +{images.length - 4}
                    </span>
                  ) : (
                    <span className="absolute inset-0 grid place-items-center bg-midnight/0 opacity-0 transition-all group-hover:bg-midnight/35 group-hover:opacity-100">
                      <Expand className="size-4 text-background" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {interactive && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-1 right-1 size-7 rounded-full bg-midnight/70 text-background grid place-items-center"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="p-3 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-lg leading-none">Room {room.room_number}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">{room.room_type.name}</div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3 shrink-0" />
            {adults} adult{adults > 1 ? "s" : ""}
            {kids ? ` + ${kids} kid${kids > 1 ? "s" : ""}` : ""}
          </span>
          <span className="font-semibold text-sm">{formatBDT(room.room_type.base_price)}</span>
        </div>

        {/* Say whose photos these are. Showing another cabin's picture as if it
            were this exact room is a small lie a guest can catch on arrival. */}
        {room.preview_source === "room_type" && (
          <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground pt-1 leading-snug">
            <Info className="size-3 shrink-0 mt-px" />
            Photos of a {room.room_type.name.toLowerCase()} — this cabin is laid out the same way.
          </p>
        )}
        {images.length === 0 && (
          <p className="text-[10px] text-muted-foreground pt-1">No photos of this cabin yet.</p>
        )}
      </div>
    </div>
  );

  const viewer = (
    <AnimatePresence>
      {lightboxAt !== null && (
        <ImageLightbox
          images={images}
          roomNumber={room.room_number}
          index={lightboxAt}
          onClose={closeLightbox}
          onNavigate={(delta) =>
            setLightboxAt((i) => (i === null ? i : (i + delta + images.length) % images.length))
          }
        />
      )}
    </AnimatePresence>
  );

  if (!interactive) {
    return (
      <>
        {createPortal(card, document.body)}
        {viewer}
      </>
    );
  }

  // Tapped open: a backdrop, so it can be dismissed the way a sheet should be.
  return createPortal(
    <div className="fixed inset-0 z-100" onClick={onClose}>
      {card}
    </div>,
    document.body,
  );
}
