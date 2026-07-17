import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BedDouble,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  createStaffCabin,
  deleteStaffCabin,
  deleteStaffCabinImage,
  getStaffCabins,
  getStaffRoomTypes,
  getStaffShips,
  updateStaffCabin,
  updateStaffCabinImage,
  uploadStaffCabinImage,
} from "@/lib/api/staff";
import type { StaffCabin, StaffCabinWrite } from "@/lib/api/staffTypes";
import {
  DialogShell,
  PageHeader,
  StaffField,
  errorText,
  staffInputClass,
} from "@/components/staff/ui";

export const Route = createFileRoute("/staff/cabins")({
  component: StaffCabins,
  head: () => ({ meta: [{ title: "Cabins — Staff Dashboard" }] }),
});

/* ── Text ⇄ structured-content helpers ──────────────────────────────────────
 * The dashboard edits features/amenities/highlights as plain textareas, one
 * entry per line, so staff never touch JSON:
 *   features   → one feature per line
 *   amenities  → "Label: Value" per line
 *   highlights → "Title | description" per line
 */
const linesToFeatures = (text: string) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean);

const linesToAmenities = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      return idx === -1
        ? { label: line, value: "" }
        : { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });

const linesToHighlights = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("|");
      return idx === -1
        ? { title: line, desc: "" }
        : { title: line.slice(0, idx).trim(), desc: line.slice(idx + 1).trim() };
    });

const featuresToLines = (features: string[]) => features.join("\n");
const amenitiesToLines = (amenities: { label: string; value: string }[]) =>
  amenities.map((a) => `${a.label}: ${a.value}`).join("\n");
const highlightsToLines = (highlights: { title: string; desc: string }[]) =>
  highlights.map((h) => `${h.title} | ${h.desc}`).join("\n");

function StaffCabins() {
  const queryClient = useQueryClient();
  const cabinsQuery = useQuery({ queryKey: ["staff", "cabins"], queryFn: getStaffCabins });
  const shipsQuery = useQuery({ queryKey: ["staff", "ships"], queryFn: getStaffShips });
  const roomTypesQuery = useQuery({ queryKey: ["staff", "room-types"], queryFn: getStaffRoomTypes });

  const [editing, setEditing] = useState<StaffCabin | "new" | null>(null);
  const [photosFor, setPhotosFor] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["staff", "cabins"] });
    // Public pages read the same content — drop their caches too so a staff
    // edit shows up without a hard refresh in the same browser.
    queryClient.invalidateQueries({ queryKey: ["cabins"] });
  };

  const toggleMutation = useMutation({
    mutationFn: (cabin: StaffCabin) =>
      updateStaffCabin(cabin.id, { is_active: !cabin.is_active }),
    onSuccess: (cabin) => {
      toast.success(cabin.is_active ? "Cabin is now visible on the website." : "Cabin hidden from the website.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffCabin,
    onSuccess: () => {
      toast.success("Cabin deleted.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const cabins = cabinsQuery.data ?? [];
  const photosCabin = cabins.find((c) => c.id === photosFor) ?? null;

  return (
    <section className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Cabins"
        subtitle="The cabin cards & detail pages shown on the public website — content, photos and the card's main image."
      >
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe"
        >
          <Plus className="size-3.5" /> New cabin
        </button>
      </PageHeader>

      {cabinsQuery.isLoading && (
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cabins.map((cabin) => {
          const main = cabin.images.find((img) => img.is_main) ?? cabin.images[0];
          return (
            <div
              key={cabin.id}
              className={`rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-luxe ${
                cabin.is_active ? "border-border" : "border-dashed border-border opacity-70"
              }`}
            >
              <div className="relative h-40 bg-ocean/5">
                {main ? (
                  <img
                    src={main.image_url}
                    alt={cabin.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full grid place-items-center text-ocean/25">
                    <BedDouble className="size-8" />
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-black/55 text-white">
                  {cabin.images.length ? `${cabin.images.length} photo${cabin.images.length > 1 ? "s" : ""}` : "No photos"}
                </span>
                {!cabin.is_active && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100/95 text-amber-700">
                    Hidden
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="font-display text-lg leading-tight">{cabin.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {[cabin.ship_name, cabin.occupancy || cabin.room_type_name, cabin.size_label]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setPhotosFor(cabin.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-[10px] font-semibold uppercase tracking-[0.1em] hover:border-gold hover:text-gold-text transition-colors"
                  >
                    <Images className="size-3" /> Photos
                  </button>
                  <button
                    onClick={() => setEditing(cabin)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-[10px] font-semibold uppercase tracking-[0.1em] hover:border-gold hover:text-gold-text transition-colors"
                  >
                    <Pencil className="size-3" /> Edit
                  </button>
                  <button
                    onClick={() => toggleMutation.mutate(cabin)}
                    title={cabin.is_active ? "Hide from website" : "Show on website"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-[10px] font-semibold uppercase tracking-[0.1em] hover:border-gold hover:text-gold-text transition-colors"
                  >
                    {cabin.is_active ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    {cabin.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${cabin.name}" and all its photos? This cannot be undone.`)) {
                        deleteMutation.mutate(cabin.id);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-[10px] font-semibold uppercase tracking-[0.1em] text-destructive hover:border-destructive transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!cabinsQuery.isLoading && cabins.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No cabins yet — create the first one.
        </div>
      )}

      {editing && (
        <CabinFormDialog
          cabin={editing === "new" ? null : editing}
          ships={shipsQuery.data ?? []}
          roomTypes={roomTypesQuery.data ?? []}
          onClose={() => setEditing(null)}
          invalidate={invalidate}
        />
      )}

      {photosCabin && (
        <CabinPhotosDialog
          cabin={photosCabin}
          onClose={() => setPhotosFor(null)}
          invalidate={invalidate}
        />
      )}
    </section>
  );
}

/* ── Create / edit dialog ─────────────────────────────────────────────────── */

function CabinFormDialog({
  cabin,
  ships,
  roomTypes,
  onClose,
  invalidate,
}: {
  cabin: StaffCabin | null;
  ships: { id: number; name: string }[];
  roomTypes: { id: number; name: string; max_adults: number; max_kids: number }[];
  onClose: () => void;
  invalidate: () => void;
}) {
  const [form, setForm] = useState(() => ({
    ship: cabin?.ship ?? ships[0]?.id ?? 0,
    room_type: cabin?.room_type ?? null,
    name: cabin?.name ?? "",
    tagline: cabin?.tagline ?? "",
    size_label: cabin?.size_label ?? "",
    description: cabin?.description ?? "",
    features: featuresToLines(cabin?.features ?? []),
    amenities: amenitiesToLines(cabin?.amenities ?? []),
    highlights: highlightsToLines(cabin?.highlights ?? []),
    sort_order: cabin?.sort_order ?? 0,
  }));

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: StaffCabinWrite = {
        ship: Number(form.ship),
        room_type: form.room_type ? Number(form.room_type) : null,
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        size_label: form.size_label.trim(),
        description: form.description.trim(),
        features: linesToFeatures(form.features),
        amenities: linesToAmenities(form.amenities),
        highlights: linesToHighlights(form.highlights),
        sort_order: Number(form.sort_order) || 0,
      };
      return cabin ? updateStaffCabin(cabin.id, payload) : createStaffCabin(payload);
    },
    onSuccess: () => {
      toast.success(cabin ? "Cabin updated." : "Cabin created — now add photos.");
      invalidate();
      onClose();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell wide title={cabin ? `Edit — ${cabin.name}` : "New cabin"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) {
            toast.error("Cabin name is required.");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <StaffField label="Cabin name *">
            <input
              className={staffInputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Premier Balcony Suite"
            />
          </StaffField>
          <StaffField label="Size badge (optional)">
            <input
              className={staffInputClass}
              value={form.size_label}
              onChange={(e) => set("size_label", e.target.value)}
              placeholder="32 m²"
            />
          </StaffField>
          <StaffField label="Ship">
            <select
              className={staffInputClass}
              value={form.ship}
              onChange={(e) => set("ship", Number(e.target.value))}
            >
              {ships.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </StaffField>
          <StaffField label="Room type (shows occupancy on the card)">
            <select
              className={staffInputClass}
              value={form.room_type ?? ""}
              onChange={(e) => set("room_type", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— none —</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name} ({rt.max_adults} adults{rt.max_kids ? ` + ${rt.max_kids} kids` : ""})
                </option>
              ))}
            </select>
          </StaffField>
        </div>

        <StaffField label="Tagline (one line, under the name on the detail page)">
          <input
            className={staffInputClass}
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="Floor-to-ceiling glass, private deck, river at your doorstep."
          />
        </StaffField>

        <StaffField label="Description (detail page 'About this cabin')">
          <textarea
            className={`${staffInputClass} min-h-24`}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </StaffField>

        <StaffField label="Features — one per line (first 4 show on the card)">
          <textarea
            className={`${staffInputClass} min-h-28 font-mono text-xs`}
            value={form.features}
            onChange={(e) => set("features", e.target.value)}
            placeholder={"Private river-facing balcony\nKing-size bed with Egyptian cotton"}
          />
        </StaffField>

        <StaffField label="Cabin specs — one per line as Label: Value (detail page table)">
          <textarea
            className={`${staffInputClass} min-h-28 font-mono text-xs`}
            value={form.amenities}
            onChange={(e) => set("amenities", e.target.value)}
            placeholder={"Size: 32 m²\nBed type: King\nInternet: Starlink Wi-Fi"}
          />
        </StaffField>

        <StaffField label="Highlights — one per line as Title | description (detail page blocks)">
          <textarea
            className={`${staffInputClass} min-h-24 font-mono text-xs`}
            value={form.highlights}
            onChange={(e) => set("highlights", e.target.value)}
            placeholder={"Private Balcony | Step outside at dawn and watch mist rise over the delta."}
          />
        </StaffField>

        <div className="grid sm:grid-cols-2 gap-4">
          <StaffField label="Display order (lower shows first)">
            <input
              type="number"
              min={0}
              className={staffInputClass}
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </StaffField>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-border text-xs uppercase tracking-[0.15em] font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-40"
          >
            {saveMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {cabin ? "Save changes" : "Create cabin"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ── Photos dialog: upload, caption, delete, choose the main (card) image ── */

function CabinPhotosDialog({
  cabin,
  onClose,
  invalidate,
}: {
  cabin: StaffCabin;
  onClose: () => void;
  invalidate: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const images = cabin.images;

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setUploading(true);
      const nextOrder = images.length
        ? Math.max(...images.map((i) => i.sort_order)) + 1
        : 0;
      // Sequential, so sort_order stays deterministic and one failure
      // doesn't abort the files already uploaded.
      for (const [i, file] of files.entries()) {
        await uploadStaffCabinImage({
          cabin: cabin.id,
          file,
          sort_order: nextOrder + i,
          // First photo of an empty gallery becomes the card image
          // automatically — staff can change it later with the star.
          is_main: images.length === 0 && i === 0,
        });
      }
      return files.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} photo(s) added to ${cabin.name}.`);
      invalidate();
    },
    onError: (err) => {
      toast.error(errorText(err));
      invalidate(); // some files may have landed before the failure
    },
    onSettled: () => setUploading(false),
  });

  const mainMutation = useMutation({
    mutationFn: (id: number) => updateStaffCabinImage(id, { is_main: true }),
    onSuccess: () => {
      toast.success("Main photo updated — this now shows on the cabin card.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const captionMutation = useMutation({
    mutationFn: ({ id, caption }: { id: number; caption: string }) =>
      updateStaffCabinImage(id, { caption }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffCabinImage,
    onSuccess: () => {
      toast.success("Photo deleted.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell wide title={`${cabin.name} — Photos`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {images.length} photo(s). The <Star className="inline size-3 text-gold fill-gold" /> photo
            is the cabin card's main image; the rest appear in the detail page gallery.
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) uploadMutation.mutate(files);
              e.target.value = ""; // allow re-selecting the same file
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-40"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
            Add photos
          </button>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <figure key={img.id} className="space-y-1.5">
                <div
                  className={`relative group rounded-xl overflow-hidden border ${
                    img.is_main ? "border-gold ring-1 ring-gold" : "border-border"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || cabin.name}
                    className="h-32 w-full object-cover"
                    loading="lazy"
                  />
                  {img.is_main && (
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold text-ocean text-[9px] font-semibold">
                      <Star className="size-2.5 fill-ocean" /> Main
                    </span>
                  )}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!img.is_main && (
                      <button
                        title="Make this the card's main image"
                        onClick={() => mainMutation.mutate(img.id)}
                        className="size-6 grid place-items-center rounded-full bg-black/55 text-white hover:bg-gold hover:text-ocean transition-colors"
                      >
                        <Star className="size-3" />
                      </button>
                    )}
                    <button
                      title="Delete photo"
                      onClick={() => {
                        if (window.confirm("Delete this photo?")) deleteMutation.mutate(img.id);
                      }}
                      className="size-6 grid place-items-center rounded-full bg-black/55 text-white hover:bg-destructive transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <input
                  defaultValue={img.caption}
                  placeholder="Caption (optional)"
                  className="w-full bg-background border border-border rounded-lg py-1.5 px-2 text-[11px] focus:outline-none focus:border-gold"
                  onBlur={(e) => {
                    if (e.target.value !== img.caption) {
                      captionMutation.mutate({ id: img.id, caption: e.target.value });
                    }
                  }}
                />
              </figure>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No photos yet. The first photo you add becomes the card image automatically.
          </div>
        )}
      </div>
    </DialogShell>
  );
}
