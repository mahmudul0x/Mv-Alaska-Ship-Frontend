import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getStaffPackages, getStaffShips } from "@/lib/api/staff";
import {
  createStaffPromotion,
  deleteStaffPromotion,
  getStaffPromotions,
  updateStaffPromotion,
  type StaffPromotion,
  type StaffPromotionWrite,
} from "@/lib/api/staffPromotions";
import {
  PageHeader,
  SectionCard,
  StaffField,
  errorText,
  staffInputClass,
} from "@/components/staff/ui";

export const Route = createFileRoute("/staff/promotions")({
  component: StaffPromotions,
  head: () => ({ meta: [{ title: "Offers — Staff Dashboard" }] }),
});

/** A datetime-local input speaks "YYYY-MM-DDTHH:mm" with no zone; the API
 *  speaks ISO. Converting through the Date object keeps the browser's own
 *  timezone rules, which for this team is Asia/Dhaka — the same zone the
 *  server stores in. */
function toInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInputValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type FormState = {
  ship: number | null;
  badge_label: string;
  title: string;
  subtitle: string;
  body: string;
  cta_label: string;
  cta_url: string;
  linked_package: number | null;
  show_in_modal: boolean;
  show_in_hero: boolean;
  show_in_home_section: boolean;
  modal_frequency: StaffPromotion["modal_frequency"];
  modal_delay_seconds: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  sort_order: number;
};

const BLANK: FormState = {
  ship: null,
  badge_label: "",
  title: "",
  subtitle: "",
  body: "",
  cta_label: "",
  cta_url: "",
  linked_package: null,
  show_in_modal: true,
  show_in_hero: true,
  show_in_home_section: true,
  modal_frequency: "daily",
  modal_delay_seconds: 3,
  starts_at: "",
  ends_at: "",
  is_active: true,
  sort_order: 0,
};

function StaffPromotions() {
  const queryClient = useQueryClient();

  const promotionsQuery = useQuery({
    queryKey: ["staff", "promotions"],
    queryFn: getStaffPromotions,
  });
  const shipsQuery = useQuery({ queryKey: ["staff", "ships"], queryFn: getStaffShips });
  // Wrapped in an arrow: getStaffPackages' first parameter is `page`, and
  // react-query would otherwise hand it the query context object.
  const packagesQuery = useQuery({
    queryKey: ["staff", "packages", "active"],
    // "active" is the group worth promoting; a departed sailing takes its own
    // promotion down on its own (Promotion.is_live).
    queryFn: () => getStaffPackages(1, "active"),
  });

  const promotions = promotionsQuery.data ?? [];
  const ships = shipsQuery.data ?? [];

  const [editing, setEditing] = useState<StaffPromotion | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = creating || editing !== null;

  // Default the ship once the list arrives, so a single-ship deployment never
  // makes anyone choose.
  useEffect(() => {
    if (form.ship === null && ships.length) {
      setForm((f) => ({ ...f, ship: ships[0].id }));
    }
  }, [ships, form.ship]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["staff", "promotions"] });
    // The public site reads the same rows — drop its cache so an edit shows up
    // without a hard refresh in this browser.
    queryClient.invalidateQueries({ queryKey: ["promotions"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: StaffPromotionWrite = {
        ship: form.ship ?? undefined,
        badge_label: form.badge_label,
        title: form.title,
        subtitle: form.subtitle,
        body: form.body,
        cta_label: form.cta_label,
        cta_url: form.cta_url,
        linked_package: form.linked_package,
        show_in_modal: form.show_in_modal,
        show_in_hero: form.show_in_hero,
        show_in_home_section: form.show_in_home_section,
        modal_frequency: form.modal_frequency,
        modal_delay_seconds: form.modal_delay_seconds,
        starts_at: fromInputValue(form.starts_at),
        ends_at: fromInputValue(form.ends_at),
        is_active: form.is_active,
        sort_order: form.sort_order,
        image: imageFile,
      };
      return editing
        ? updateStaffPromotion(editing.id, payload)
        : createStaffPromotion(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Offer updated" : "Offer published");
      closeForm();
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: (promotion: StaffPromotion) =>
      updateStaffPromotion(promotion.id, { is_active: !promotion.is_active }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStaffPromotion(id),
    onSuccess: () => {
      toast.success("Offer deleted");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  function openCreate() {
    setEditing(null);
    setForm({ ...BLANK, ship: ships[0]?.id ?? null });
    setImageFile(null);
    setCreating(true);
  }

  function openEdit(promotion: StaffPromotion) {
    setCreating(false);
    setEditing(promotion);
    setImageFile(null);
    setForm({
      ship: promotion.ship,
      badge_label: promotion.badge_label,
      title: promotion.title,
      subtitle: promotion.subtitle,
      body: promotion.body,
      cta_label: promotion.cta_label,
      cta_url: promotion.cta_url,
      linked_package: promotion.linked_package,
      show_in_modal: promotion.show_in_modal,
      show_in_hero: promotion.show_in_hero,
      show_in_home_section: promotion.show_in_home_section,
      modal_frequency: promotion.modal_frequency,
      modal_delay_seconds: promotion.modal_delay_seconds,
      starts_at: toInputValue(promotion.starts_at),
      ends_at: toInputValue(promotion.ends_at),
      is_active: promotion.is_active,
      sort_order: promotion.sort_order,
    });
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Object URL for the pending upload, revoked on change so a staff member
  // swapping images half a dozen times does not leak them all.
  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const shownImage = previewUrl ?? editing?.image_url ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        subtitle="Announcements shown on the website — as a pop-up, a strip across the hero, and a banner on the home page."
      >
        <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
          <Plus className="size-4" />
          New offer
        </button>
      </PageHeader>

      {promotionsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : promotions.length === 0 ? (
        <SectionCard title="No offers yet">
          <p className="text-sm text-muted-foreground">
            Nothing is being shown on the website. Create an offer to put a
            pop-up, a hero strip and a home-page banner live at once — you
            choose which of the three.
          </p>
        </SectionCard>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promotion) => (
            <PromotionRow
              key={promotion.id}
              promotion={promotion}
              onEdit={() => openEdit(promotion)}
              onToggle={() => toggleMutation.mutate(promotion)}
              onDelete={() => {
                if (
                  window.confirm(
                    `Delete "${promotion.title}"? This cannot be undone — to take it off the website temporarily, hide it instead.`,
                  )
                ) {
                  deleteMutation.mutate(promotion.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl rounded-xl bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit offer" : "New offer"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {ships.length > 1 && (
                  <StaffField label="Ship">
                    <select
                      className={staffInputClass}
                      value={form.ship ?? ""}
                      onChange={(e) => set("ship", Number(e.target.value))}
                    >
                      {ships.map((ship) => (
                        <option key={ship.id} value={ship.id}>
                          {ship.name}
                        </option>
                      ))}
                    </select>
                  </StaffField>
                )}

                <StaffField label="Badge (optional)">
                  <input
                    className={staffInputClass}
                    value={form.badge_label}
                    maxLength={40}
                    placeholder="EID OFFER"
                    onChange={(e) => set("badge_label", e.target.value)}
                  />
                </StaffField>
              </div>

              <StaffField label="Headline">
                <input
                  className={staffInputClass}
                  value={form.title}
                  maxLength={120}
                  required
                  placeholder="Save 20% on the Eid sailing"
                  onChange={(e) => set("title", e.target.value)}
                />
              </StaffField>

              <StaffField label="One supporting line (optional)">
                <input
                  className={staffInputClass}
                  value={form.subtitle}
                  maxLength={200}
                  placeholder="Three days, two nights, all meals included"
                  onChange={(e) => set("subtitle", e.target.value)}
                />
              </StaffField>

              <StaffField label="Longer text — shown in the pop-up only (optional)">
                <textarea
                  className={`${staffInputClass} min-h-24`}
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                />
              </StaffField>

              {/* ── Artwork ─────────────────────────────────────────────── */}
              <StaffField label="Banner image (optional)">
                <div className="flex items-start gap-4">
                  {shownImage ? (
                    <img
                      src={shownImage}
                      alt=""
                      className="h-24 w-40 rounded-lg object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <ImagePlus className="size-5" />
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      className="block text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Landscape works best — it is shown wide in the pop-up and
                      beside the text on the home page. Without one, both fall
                      back to a text-only layout that still looks deliberate.
                    </p>
                  </div>
                </div>
              </StaffField>

              {/* ── Button ──────────────────────────────────────────────── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <StaffField label="Button text (optional)">
                  <input
                    className={staffInputClass}
                    value={form.cta_label}
                    maxLength={40}
                    placeholder="See packages"
                    onChange={(e) => set("cta_label", e.target.value)}
                  />
                </StaffField>

                <StaffField label="Link to a sailing (optional)">
                  <select
                    className={staffInputClass}
                    value={form.linked_package ?? ""}
                    onChange={(e) =>
                      set(
                        "linked_package",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">— no sailing —</option>
                    {(packagesQuery.data?.results ?? []).map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.start_date}
                      </option>
                    ))}
                  </select>
                </StaffField>
              </div>

              {!form.linked_package && (
                <StaffField label="…or a link of your own">
                  <input
                    className={staffInputClass}
                    value={form.cta_url}
                    placeholder="/packages"
                    onChange={(e) => set("cta_url", e.target.value)}
                  />
                </StaffField>
              )}

              {form.linked_package !== null && (
                <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  The button will go to this sailing, and the offer will take
                  itself off the website once the ship has departed — so there
                  is nothing to remember to remove.
                </p>
              )}

              {/* ── Placement ───────────────────────────────────────────── */}
              <StaffField label="Where it appears">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Toggle
                    label="Pop-up"
                    hint="Opens by itself"
                    checked={form.show_in_modal}
                    onChange={(v) => set("show_in_modal", v)}
                  />
                  <Toggle
                    label="Hero strip"
                    hint="Slim gold bar"
                    checked={form.show_in_hero}
                    onChange={(v) => set("show_in_hero", v)}
                  />
                  <Toggle
                    label="Home banner"
                    hint="Section on the page"
                    checked={form.show_in_home_section}
                    onChange={(v) => set("show_in_home_section", v)}
                  />
                </div>
              </StaffField>

              {form.show_in_modal && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <StaffField label="How often one visitor sees the pop-up">
                    <select
                      className={staffInputClass}
                      value={form.modal_frequency}
                      onChange={(e) =>
                        set(
                          "modal_frequency",
                          e.target.value as FormState["modal_frequency"],
                        )
                      }
                    >
                      <option value="daily">Once a day (recommended)</option>
                      <option value="once">Once, ever</option>
                      <option value="every_visit">Every visit</option>
                    </select>
                  </StaffField>

                  <StaffField label="Seconds before it opens">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      className={staffInputClass}
                      value={form.modal_delay_seconds}
                      onChange={(e) =>
                        set("modal_delay_seconds", Number(e.target.value))
                      }
                    />
                  </StaffField>
                </div>
              )}

              {/* ── Schedule ────────────────────────────────────────────── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <StaffField label="Starts (blank = right away)">
                  <input
                    type="datetime-local"
                    className={staffInputClass}
                    value={form.starts_at}
                    onChange={(e) => set("starts_at", e.target.value)}
                  />
                </StaffField>
                <StaffField label="Ends (blank = until switched off)">
                  <input
                    type="datetime-local"
                    className={staffInputClass}
                    value={form.ends_at}
                    onChange={(e) => set("ends_at", e.target.value)}
                  />
                </StaffField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Toggle
                  label="Switched on"
                  hint="Uncheck to hide everywhere"
                  checked={form.is_active}
                  onChange={(v) => set("is_active", v)}
                />
                <StaffField label="Order (lower shows first)">
                  <input
                    type="number"
                    min={0}
                    className={staffInputClass}
                    value={form.sort_order}
                    onChange={(e) => set("sort_order", Number(e.target.value))}
                  />
                </StaffField>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
                >
                  {saveMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {editing ? "Save changes" : "Publish offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition hover:bg-muted/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-primary"
      />
      <span className="text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

function PromotionRow({
  promotion,
  onEdit,
  onToggle,
  onDelete,
}: {
  promotion: StaffPromotion;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const places = [
    promotion.show_in_modal && "Pop-up",
    promotion.show_in_hero && "Hero",
    promotion.show_in_home_section && "Home banner",
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-border sm:flex-row sm:items-center">
      {promotion.image_url ? (
        <img
          src={promotion.image_url}
          alt=""
          className="h-20 w-32 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Megaphone className="size-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* The single honest answer to "is this showing right now?" — it
              folds in the switch, the dates and whether a linked sailing has
              already departed, which is the case staff otherwise miss. */}
          {promotion.is_live ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              Live now
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              Not showing
            </span>
          )}
          {promotion.badge_label && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {promotion.badge_label}
            </span>
          )}
        </div>

        <h3 className="mt-1 truncate font-semibold">{promotion.title}</h3>
        {promotion.subtitle && (
          <p className="truncate text-sm text-muted-foreground">
            {promotion.subtitle}
          </p>
        )}

        <p className="mt-1 text-xs text-muted-foreground">
          {places.length ? places.join(" · ") : "Shown nowhere"}
          {promotion.linked_package_label && ` · ${promotion.linked_package_label}`}
        </p>

        {(promotion.starts_at || promotion.ends_at) && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3" />
            {promotion.starts_at
              ? new Date(promotion.starts_at).toLocaleDateString()
              : "now"}
            {" → "}
            {promotion.ends_at
              ? new Date(promotion.ends_at).toLocaleDateString()
              : "until switched off"}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onToggle}
          title={promotion.is_active ? "Hide from the website" : "Show on the website"}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
        >
          {promotion.is_active ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
