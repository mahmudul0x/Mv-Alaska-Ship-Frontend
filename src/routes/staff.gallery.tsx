import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ImagePlus, Images, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteStaffGalleryImage,
  getStaffGalleryImages,
  getStaffShips,
  updateStaffGalleryImage,
  uploadStaffGalleryImage,
} from "@/lib/api/staff";
import type { StaffGalleryImage } from "@/lib/api/staffTypes";
import { PageHeader, errorText, staffInputClass } from "@/components/staff/ui";

export const Route = createFileRoute("/staff/gallery")({
  component: StaffGallery,
  head: () => ({ meta: [{ title: "Gallery — Staff Dashboard" }] }),
});

function StaffGallery() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const imagesQuery = useQuery({
    queryKey: ["staff", "gallery-images"],
    queryFn: getStaffGalleryImages,
  });
  const shipsQuery = useQuery({ queryKey: ["staff", "ships"], queryFn: getStaffShips });

  const ships = shipsQuery.data ?? [];
  const [shipId, setShipId] = useState<number | null>(null);
  const activeShip = shipId ?? ships[0]?.id ?? null;

  const images = imagesQuery.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["staff", "gallery-images"] });
    // The public /gallery page reads the same content — drop its cache too so
    // a staff edit shows up without a hard refresh in the same browser.
    queryClient.invalidateQueries({ queryKey: ["gallery"] });
  };

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!activeShip) throw new Error("No ship available to attach photos to.");
      setUploading(true);
      const nextOrder = images.length
        ? Math.max(...images.map((i) => i.sort_order)) + 1
        : 0;
      // Sequential, so sort_order stays deterministic and one failure
      // doesn't abort the files already uploaded.
      for (const [i, file] of files.entries()) {
        await uploadStaffGalleryImage({
          ship: activeShip,
          file,
          sort_order: nextOrder + i,
        });
      }
      return files.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} photo(s) added to the gallery.`);
      invalidate();
    },
    onError: (err) => {
      toast.error(errorText(err));
      invalidate(); // some files may have landed before the failure
    },
    onSettled: () => setUploading(false),
  });

  const captionMutation = useMutation({
    mutationFn: ({ id, caption }: { id: number; caption: string }) =>
      updateStaffGalleryImage(id, { caption }),
    onSuccess: () => {
      toast.success("Caption saved.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: (img: StaffGalleryImage) =>
      updateStaffGalleryImage(img.id, { is_active: !img.is_active }),
    onSuccess: (img) => {
      toast.success(
        img.is_active ? "Photo is now visible on the website." : "Photo hidden from the website.",
      );
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const orderMutation = useMutation({
    mutationFn: ({ id, sort_order }: { id: number; sort_order: number }) =>
      updateStaffGalleryImage(id, { sort_order }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffGalleryImage,
    onSuccess: () => {
      toast.success("Photo deleted.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <section className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Gallery"
        subtitle="The photos shown on the public Gallery page — upload, write a caption on each, reorder, hide or delete."
      >
        <div className="flex items-center gap-2">
          {ships.length > 1 && (
            <select
              className={`${staffInputClass} w-auto`}
              value={activeShip ?? ""}
              onChange={(e) => setShipId(Number(e.target.value))}
              title="Ship new uploads belong to"
            >
              {ships.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
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
            disabled={uploading || !activeShip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-40"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
            Add photos
          </button>
        </div>
      </PageHeader>

      {imagesQuery.isLoading && (
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}

      {!imagesQuery.isLoading && images.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Images className="size-8 mx-auto mb-3 opacity-40" />
          <div className="text-sm">
            No gallery photos yet — add the first ones and they appear on the website instantly.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((img) => (
          <figure
            key={img.id}
            className={`rounded-2xl border bg-card overflow-hidden space-y-0 ${
              img.is_active ? "border-border" : "border-dashed border-border opacity-70"
            }`}
          >
            <div className="relative group">
              <img
                src={img.image_url}
                alt={img.caption || "Gallery photo"}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              {!img.is_active && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100/95 text-amber-700">
                  Hidden
                </span>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  title={img.is_active ? "Hide from website" : "Show on website"}
                  onClick={() => toggleMutation.mutate(img)}
                  className="size-7 grid place-items-center rounded-full bg-black/55 text-white hover:bg-gold hover:text-ocean transition-colors"
                >
                  {img.is_active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <button
                  title="Delete photo"
                  onClick={() => {
                    if (window.confirm("Delete this photo from the gallery? This cannot be undone.")) {
                      deleteMutation.mutate(img.id);
                    }
                  }}
                  className="size-7 grid place-items-center rounded-full bg-black/55 text-white hover:bg-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <figcaption className="p-3 space-y-2">
              <textarea
                defaultValue={img.caption}
                placeholder="Write a caption for this photo…"
                rows={2}
                className="w-full bg-background border border-border rounded-lg py-1.5 px-2 text-[11px] resize-none focus:outline-none focus:border-gold"
                onBlur={(e) => {
                  if (e.target.value !== img.caption) {
                    captionMutation.mutate({ id: img.id, caption: e.target.value });
                  }
                }}
              />
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                <label className="flex items-center gap-1.5">
                  Order
                  <input
                    type="number"
                    min={0}
                    defaultValue={img.sort_order}
                    className="w-14 bg-background border border-border rounded-lg py-1 px-1.5 text-[11px] focus:outline-none focus:border-gold"
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (Number.isFinite(value) && value >= 0 && value !== img.sort_order) {
                        orderMutation.mutate({ id: img.id, sort_order: value });
                      }
                    }}
                  />
                </label>
                {ships.length > 1 && <span className="truncate">{img.ship_name}</span>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
