import { useEffect, useRef, useState } from "react";
import { BedDouble, LayoutList } from "lucide-react";

/** Two-option guide-report download menu.
 *
 * Clicking the trigger opens a small popover with "Booked rooms" (the dues
 * sheet) and "All rooms" (booked first, then the available cabins). The parent
 * supplies the trigger element and the download handler; this only owns the
 * open/close + option list, so it drops into both the packages table row and
 * the room-map toolbar without duplicating the menu markup.
 */
export function GuideReportMenu({
  trigger,
  onSelect,
  align = "end",
}: {
  trigger: (open: boolean) => React.ReactNode;
  onSelect: (scope: "booked" | "all") => void;
  /** Which edge the popover aligns to (row actions sit at the right edge). */
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape — a bare popover that only the trigger can
  // dismiss traps the user if they change their mind.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (scope: "booked" | "all") => {
    setOpen(false);
    onSelect(scope);
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="contents">
        {trigger(open)}
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1 z-30 w-56 rounded-xl border border-border bg-card shadow-luxe overflow-hidden ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          <button
            type="button"
            onClick={() => choose("booked")}
            className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ocean/4 transition-colors"
          >
            <BedDouble className="size-4 text-gold shrink-0 mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-foreground">Booked rooms</span>
              <span className="block text-[11px] text-muted-foreground leading-snug">
                Only booked cabins — the dues collection sheet.
              </span>
            </span>
          </button>
          <div className="border-t border-border" />
          <button
            type="button"
            onClick={() => choose("all")}
            className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ocean/4 transition-colors"
          >
            <LayoutList className="size-4 text-gold shrink-0 mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-foreground">All rooms</span>
              <span className="block text-[11px] text-muted-foreground leading-snug">
                Every cabin — booked first, then the available ones.
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
