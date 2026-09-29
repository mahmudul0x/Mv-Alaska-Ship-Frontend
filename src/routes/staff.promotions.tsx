import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Eye,
  EyeOff,
  ImagePlus,
  LayoutPanelTop,
  Loader2,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  PanelTop,
  Pencil,
  Plus,
  Ship,
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

/** How a sailing is named in the picker.
 *
 *  A bare start date does not identify anything — several sailings a month, all
 *  looking like "2026-10-17". Lead with the name staff gave it, fall back to the
 *  ship when they gave it none, and always carry the date range so two runs of
 *  the same package are still distinguishable.
 *
 *  Matches StaffPromotionSerializer.get_linked_package_label on the server, so
 *  the picker and the saved row read the same. Keep the two in step. */
function sailingLabel(pkg: {
  marketing_title: string;
  ship_name: string;
  start_date: string;
  end_date: string;
}): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const name = pkg.marketing_title?.trim() || pkg.ship_name;
  return `${name} — ${fmt(pkg.start_date)} → ${fmt(pkg.end_date)}`;
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
  show_in_top_bar: boolean;
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
  show_in_top_bar: true,
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
        show_in_top_bar: form.show_in_top_bar,
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
      show_in_top_bar: promotion.show_in_top_bar,
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

  // What the end date was last auto-filled to. Without this, changing sailings
  // would either strand the previous sailing's date or overwrite one somebody
  // typed on purpose — this way an untouched auto value follows the sailing,
  // and a hand-typed one is never disturbed.
  const autoEndRef = useRef<string>("");

  /** Pick a sailing, and offer its booking cutoff as the offer's end date.
   *
   *  The START is deliberately NOT taken from the sailing: a sailing's start is
   *  the day the ship leaves, and an offer that begins then has missed its
   *  entire purpose. Blank — "right away" — is almost always what is wanted.
   *
   *  The END is different. Once booking closes on a sailing, an offer for it
   *  can do nothing but mislead, so the cutoff is exactly the right moment to
   *  stop showing it. Filled in rather than merely implied, so staff can see
   *  and change the date instead of trusting something invisible.
   *
   *  (The server takes a departed sailing's promotion down regardless — this
   *  is convenience and visibility, not the safety net.) */
  function pickSailing(packageId: number | null) {
    const pkg = (packagesQuery.data?.results ?? []).find((p) => p.id === packageId);

    setForm((f) => {
      const untouched = f.ends_at === "" || f.ends_at === autoEndRef.current;
      if (!pkg || !untouched) {
        return { ...f, linked_package: packageId };
      }

      // Fall back to the departure date when a package has no cutoff set: the
      // ship leaving is the latest an offer for it could possibly matter.
      const cutoff = pkg.booking_cutoff_datetime
        ? toInputValue(pkg.booking_cutoff_datetime)
        : toInputValue(`${pkg.start_date}T00:00:00`);

      autoEndRef.current = cutoff;
      return { ...f, linked_package: packageId, ends_at: cutoff };
    });
  }

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
        subtitle="What the website announces — a pop-up on arrival, a bar above the navigation, and a card on the home page."
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
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl gradient-gold text-midnight shadow-luxe">
            <Megaphone className="size-6" />
          </div>
          <h2 className="mt-5 font-display text-2xl">Nothing is being announced</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The website is showing no offer at all right now. One offer can
            appear in three places at once — a pop-up on arrival, a bar above
            the navigation and a card on the home page — and you choose which.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-midnight shadow-luxe transition hover:brightness-105"
          >
            <Plus className="size-4" />
            Create the first offer
          </button>
        </div>
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
                      pickSailing(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">— no sailing —</option>
                    {(packagesQuery.data?.results ?? []).map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {sailingLabel(pkg)}
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
                    label="Top bar"
                    hint="Above the navigation"
                    checked={form.show_in_top_bar}
                    onChange={(v) => set("show_in_top_bar", v)}
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
                <StaffField label="Starts showing (blank = right away)">
                  <input
                    type="datetime-local"
                    className={staffInputClass}
                    value={form.starts_at}
                    onChange={(e) => set("starts_at", e.target.value)}
                  />
                </StaffField>
                <StaffField label="Stops showing (blank = until switched off)">
                  <input
                    type="datetime-local"
                    className={staffInputClass}
                    value={form.ends_at}
                    onChange={(e) => set("ends_at", e.target.value)}
                  />
                </StaffField>
              </div>

              {form.linked_package !== null && form.ends_at !== "" && (
                <p className="-mt-2 text-xs text-muted-foreground">
                  The end date was filled in from that sailing&rsquo;s booking
                  cutoff — once booking closes, an offer for it can only
                  mislead. Change it if you want the offer to stop sooner.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Toggle
                  label="Switched on"
                  hint="Hides it everywhere at once, dates or no dates"
                  checked={form.is_active}
                  onChange={(v) => set("is_active", v)}
                />
                <StaffField label="Order (only matters with 2+ offers)">
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
    promotion.show_in_modal && { label: "Pop-up", icon: MessageSquare },
    promotion.show_in_top_bar && { label: "Top bar", icon: PanelTop },
    promotion.show_in_home_section && { label: "Home card", icon: LayoutPanelTop },
  ].filter(Boolean) as { label: string; icon: LucideIcon }[];

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-gold/40 hover:shadow-luxe">
      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        {/* Artwork, or the shape where artwork would be. A placeholder that
            matches the real thumbnail's footprint keeps the row heights even,
            so a list of offers reads as a list rather than a ragged stack. */}
        {promotion.image_url ? (
          <img
            src={promotion.image_url}
            alt=""
            className="h-28 w-full shrink-0 rounded-xl object-cover sm:w-44"
          />
        ) : (
          <div className="grid h-28 w-full shrink-0 place-items-center rounded-xl bg-muted/60 text-muted-foreground sm:w-44">
            <div className="text-center">
              <Megaphone className="mx-auto size-5" />
              <span className="mt-1 block text-[10px] uppercase tracking-widest">
                Text only
              </span>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <LiveState promotion={promotion} />
            {promotion.badge_label && (
              <span className="rounded-full gradient-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-midnight">
                {promotion.badge_label}
              </span>
            )}
          </div>

          <h3 className="mt-2 truncate font-display text-xl leading-tight">
            {promotion.title}
          </h3>
          {promotion.subtitle && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {promotion.subtitle}
            </p>
          )}

          {/* Where it shows, as chips rather than a run-on sentence: staff scan
              this column to answer "is the pop-up on?" at a glance. */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {places.length ? (
              places.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted/70 px-2 py-1 text-[11px] font-medium text-foreground/70"
                >
                  <Icon className="size-3" />
                  {label}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
                <EyeOff className="size-3" />
                Shown nowhere
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3" />
              {promotion.starts_at
                ? new Date(promotion.starts_at).toLocaleDateString()
                : "from now"}
              {" → "}
              {promotion.ends_at
                ? new Date(promotion.ends_at).toLocaleDateString()
                : "until switched off"}
            </span>
            {promotion.linked_package_label && (
              <span className="inline-flex items-center gap-1.5 truncate">
                <Ship className="size-3" />
                {promotion.linked_package_label}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <IconButton
            onClick={onToggle}
            title={promotion.is_active ? "Hide from the website" : "Show on the website"}
            icon={promotion.is_active ? Eye : EyeOff}
          />
          <IconButton onClick={onEdit} title="Edit" icon={Pencil} />
          <IconButton onClick={onDelete} title="Delete" icon={Trash2} destructive />
        </div>
      </div>
    </div>
  );
}

/** Why an offer is, or is not, on the website right now.
 *
 *  `is_live` is the server's verdict and folds in three separate things, so
 *  "not showing" alone leaves staff guessing which one. Naming the reason is
 *  the difference between a status light and an explanation — the case that
 *  catches people out is an offer switched on, inside its dates, and invisible
 *  because the sailing it is attached to has already left. */
function LiveState({ promotion }: { promotion: StaffPromotion }) {
  if (promotion.is_live) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Live now
      </span>
    );
  }

  const now = Date.now();
  let reason = "Switched off";
  if (promotion.is_active) {
    if (promotion.starts_at && new Date(promotion.starts_at).getTime() > now) {
      reason = "Scheduled";
    } else if (promotion.ends_at && new Date(promotion.ends_at).getTime() <= now) {
      reason = "Ended";
    } else if (promotion.linked_package) {
      reason = "Sailing departed";
    } else {
      reason = "Not showing";
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
      {reason}
    </span>
  );
}

function IconButton({
  onClick,
  title,
  icon: Icon,
  destructive,
}: {
  onClick: () => void;
  title: string;
  icon: LucideIcon;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`grid size-9 place-items-center rounded-lg transition ${
        destructive
          ? "text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}
