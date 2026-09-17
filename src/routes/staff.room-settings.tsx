import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Baby,
  Pencil,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Gift,
  Globe,
  ImagePlus,
  Images,
  Info,
  Loader2,
  Plus,
  Save,
  Ticket,
  Trash2,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { DialogShell, PageHeader, errorText, staffInputClass } from "@/components/staff/ui";
import {
  createStaffKidRule,
  deleteStaffKidRule,
  deleteStaffRoomImage,
  getStaffForeignerSurcharge,
  getStaffKidRules,
  getStaffRoomImages,
  getStaffRooms,
  getStaffRoomTypes,
  getStaffShips,
  updateStaffForeignerSurcharge,
  updateStaffKidRule,
  updateStaffRoomImage,
  updateStaffRoomType,
  updateStaffShip,
  uploadStaffRoomImage,
} from "@/lib/api/staff";
import { useLanguage, useT } from "@/lib/i18n";
import { money, num } from "@/lib/i18n/format";
import type { StringKey } from "@/lib/i18n/strings";
import type { StaffKidRule, StaffRoom, StaffRoomImage, StaffShip } from "@/lib/api/staffTypes";
import type { KidChargeType, RoomType } from "@/lib/api/types";

export const Route = createFileRoute("/staff/room-settings")({
  component: RoomSettingsPage,
});

const TABS = [
  { key: "room-types", label: "rs.tabRoomTypes", hint: "rs.tabRoomTypesHint", icon: BedDouble },
  { key: "kid-pricing", label: "rs.tabKid", hint: "rs.tabKidHint", icon: Baby },
  // Sits beside kid pricing because it is the same kind of thing: a global
  // fare policy, not a per-sailing price.
  { key: "foreigner", label: "rs.tabForeigner", hint: "rs.tabForeignerHint", icon: Globe },
  { key: "room-photos", label: "rs.tabPhotos", hint: "rs.tabPhotosHint", icon: Images },
] as const satisfies readonly { key: string; label: StringKey; hint: StringKey; icon: unknown }[];

type TabKey = (typeof TABS)[number]["key"];

function RoomSettingsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabKey>("room-types");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title={t("rs.title")} subtitle={t("rs.subtitle")} />

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map(({ key, label, hint, icon: Icon }) => {
          const active = key === activeTab;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`group flex items-center gap-2.5 px-4 py-3 -mb-px border-b-2 text-sm transition-colors ${
                active
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-gold" : "text-muted-foreground"}`} />
              <span>
                <span className="font-medium block leading-none">{t(label)}</span>
                <span className="text-[10px] text-muted-foreground block mt-1">{t(hint)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "room-types" ? (
        <RoomTypesSection />
      ) : activeTab === "kid-pricing" ? (
        <KidPricingSection />
      ) : activeTab === "foreigner" ? (
        <ForeignerSurchargeSection />
      ) : (
        <RoomPhotosSection />
      )}
    </div>
  );
}

/** Every figure on this page multiplies into every future booking, and the
 *  inputs sat one keystroke from doing so — a stray mouse-wheel over a number
 *  field is enough to change a fare without anyone noticing. So the cards open
 *  read-only and editing is something you ask for.
 *
 *  `stop` takes the caller's own reset, because only the card knows what its
 *  draft state was before someone started typing. */
function useEditLock(reset?: () => void) {
  const [editing, setEditing] = useState(false);
  return {
    editing,
    start: () => setEditing(true),
    cancel: () => {
      reset?.();
      setEditing(false);
    },
    done: () => setEditing(false),
  };
}

/** The "Edit" affordance in a locked card's header. */
function EditButton({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground hover:border-gold hover:text-gold-text transition-colors"
    >
      <Pencil className="size-3" /> {t("common.edit")}
    </button>
  );
}

/** Cancel beside Save, so backing out is as easy as committing. */
function CancelButton({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 rounded-full border border-border text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
    >
      {t("common.cancel")}
    </button>
  );
}

/* ── Room types ───────────────────────────────────────────────────────────── */

function RoomTypesSection() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "room-types"],
    queryFn: getStaffRoomTypes,
  });
  const [savingId, setSavingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RoomType> }) => {
      setSavingId(id);
      return updateStaffRoomType(id, payload);
    },
    onSuccess: () => {
      toast.success(t("rs.roomTypeUpdated"));
      queryClient.invalidateQueries({ queryKey: ["staff", "room-types"] });
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  // The ship's fare basis, so each cabin card can show what it actually costs
  // rather than leaving staff to multiply it out in their heads.
  const { data: ships } = useQuery({ queryKey: ["staff", "ships"], queryFn: getStaffShips });
  const ship = ships?.[0];

  return (
    <section className="space-y-4 pt-6">
      {ship && <FareBasisCard ship={ship} />}

      <p className="text-xs text-muted-foreground">{t("rs.cabinFareNote")}</p>

      {isLoading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> {t("rs.loadingRoomTypes")}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.map((rt) => (
            <RoomTypeCard
              key={rt.id}
              roomType={rt}
              adultFare={ship?.default_adult_price ?? null}
              berthAllowance={ship?.meal_allowance ?? null}
              saving={savingId === rt.id && mutation.isPending}
              onSave={(payload) => mutation.mutate({ id: rt.id, payload })}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RoomTypeCard({
  roomType,
  adultFare,
  berthAllowance,
  onSave,
  saving,
}: {
  roomType: RoomType;
  /** The ship's default per-adult fare, for working the cabin price out. Null
   *  until one is set, and a real sailing may be priced differently. */
  adultFare: string | null;
  /** Null when cabins are sold per head — then there is no cabin price to
   *  show, only a per-person one. */
  berthAllowance: string | null;
  onSave: (payload: Partial<RoomType>) => void;
  saving: boolean;
}) {
  const { t, lang } = useLanguage();
  const [basePrice, setBasePrice] = useState(roomType.base_price);
  // Shown only when it is doing something. A per-cabin surcharge is the rare
  // case, but one silently adding money to every booking is worse than clutter.
  const [showBase, setShowBase] = useState(Number(roomType.base_price) !== 0);
  const lock = useEditLock(() => {
    setBasePrice(roomType.base_price);
    setMaxAdults(roomType.max_adults);
    setMaxKids(roomType.max_kids);
    setShowBase(Number(roomType.base_price) !== 0);
  });
  const [maxAdults, setMaxAdults] = useState(roomType.max_adults);
  const [maxKids, setMaxKids] = useState(roomType.max_kids);
  const dirty =
    basePrice !== roomType.base_price ||
    maxAdults !== roomType.max_adults ||
    maxKids !== roomType.max_kids;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-luxe ${
        dirty ? "border-gold/50 shadow-luxe" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <BedDouble className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight truncate">{roomType.name}</div>
          <div className="text-[10px] text-muted-foreground">
            {t("rs.sleepsUpTo", { adults: num(maxAdults, lang), kids: num(maxKids, lang) })}
          </div>
        </div>
        {lock.editing ? (
          dirty && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
              {t("common.unsaved")}
            </span>
          )
        ) : (
          <EditButton onClick={lock.start} />
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] mb-1.5 flex items-center gap-1">
              <Users className="size-3" /> {t("rs.maxAdults")}
            </span>
            <input
              type="number"
              min={1}
              value={maxAdults}
              disabled={!lock.editing}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setMaxAdults(Number(e.target.value))}
              className={`${staffInputClass} disabled:bg-muted/50 disabled:text-muted-foreground`}
            />
            {/* Only when it is true. On a ship sold per head this number is
                purely a limit, and a price warning would be noise. */}
            {berthAllowance !== null && (
              <span className="mt-1.5 flex items-start gap-1 text-[10px] text-gold-text leading-snug">
                <AlertTriangle className="size-3 shrink-0 mt-px" />
                {t("rs.berthWarning")}
              </span>
            )}
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] mb-1.5 flex items-center gap-1">
              <Baby className="size-3" /> {t("rs.maxKids")}
            </span>
            <input
              type="number"
              min={0}
              value={maxKids}
              disabled={!lock.editing}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setMaxKids(Number(e.target.value))}
              className={`${staffInputClass} disabled:bg-muted/50 disabled:text-muted-foreground`}
            />
          </label>
        </div>

        {/* Folded away, because a cabin's fare comes from its berths and the
            adult fare; a flat per-room amount is for the rare cabin that costs
            more for a reason other than its size.

            It opens itself whenever it is not zero. Hiding a field that is
            quietly adding money to every booking would be far worse than
            showing one nobody needs. */}
        {showBase ? (
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] mb-1.5 flex items-center justify-between gap-2">
              <span>{t("rs.basePrice")}</span>
              <button
                type="button"
                onClick={() => setShowBase(false)}
                disabled={Number(basePrice || 0) !== 0}
                className="normal-case tracking-normal text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-0"
              >
                {t("rs.hide")}
              </button>
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <input
                type="number"
                min={0}
                value={basePrice}
                disabled={!lock.editing}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setBasePrice(e.target.value)}
                className={`${staffInputClass} pl-8 disabled:bg-muted/50 disabled:text-muted-foreground`}
              />
            </div>
            <span className="mt-1.5 block text-[10px] text-muted-foreground leading-snug">
              {t("rs.basePriceHint")}
            </span>
          </label>
        ) : (
          lock.editing && (
            <button
              type="button"
              onClick={() => setShowBase(true)}
              className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              {t("rs.addBasePrice")}
            </button>
          )
        )}

        <CabinFarePreview
          basePrice={basePrice}
          maxAdults={maxAdults}
          maxKids={maxKids}
          adultFare={adultFare}
          berthAllowance={berthAllowance}
        />

        {lock.editing && (
          <div className="flex items-center gap-2">
            <CancelButton onClick={lock.cancel} />
            <button
              disabled={!dirty || saving}
              onClick={() => {
                onSave({ base_price: basePrice, max_adults: maxAdults, max_kids: maxKids });
                lock.done();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-30 disabled:shadow-none"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {t("common.save")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Kid pricing ──────────────────────────────────────────────────────────── */

const CHARGE_META: Record<
  KidChargeType,
  { label: StringKey; hint: StringKey; icon: typeof Gift; badge: string }
> = {
  free: {
    label: "rs.chargeFree",
    hint: "rs.chargeFreeHint",
    icon: Gift,
    badge: "bg-emerald-500/10 text-emerald-700",
  },
  fixed: {
    label: "rs.chargeFixed",
    hint: "rs.chargeFixedHint",
    icon: Ticket,
    badge: "bg-gold/15 text-gold",
  },
  full_adult: {
    label: "rs.fullAdultFare",
    hint: "rs.chargeFullHint",
    icon: UserRound,
    badge: "bg-ocean/10 text-ocean",
  },
};

/* ── Foreigner surcharge ──────────────────────────────────────────────────── */

/** The one global foreign-national surcharge.
 *
 *  It lives here rather than on each package for the same reason the kid rules
 *  do: it is a pricing policy that applies to every sailing. On Package it had
 *  to be re-entered per voyage and — worse — could not be changed at all once a
 *  voyage had bookings, because a per-package price is part of what those
 *  customers were quoted.
 */
function ForeignerSurchargeSection() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "foreigner-surcharge"],
    queryFn: getStaffForeignerSurcharge,
  });

  // Draft state so the inputs stay editable while a save is in flight, seeded
  // once the row arrives.
  const [draft, setDraft] = useState<{ adult: string; kid: string } | null>(null);
  const lock = useEditLock(() => setDraft(null));
  const adult = draft?.adult ?? data?.adult_amount ?? "0.00";
  const kid = draft?.kid ?? data?.kid_amount ?? "0.00";
  const dirty =
    data !== undefined &&
    (Number(adult) !== Number(data.adult_amount) || Number(kid) !== Number(data.kid_amount));

  const mutation = useMutation({
    mutationFn: () => updateStaffForeignerSurcharge({ adult_amount: adult, kid_amount: kid }),
    onSuccess: (saved) => {
      toast.success(t("rs.foreignerUpdated"));
      setDraft(null);
      lock.done();
      queryClient.setQueryData(["staff", "foreigner-surcharge"], saved);
    },
    onError: (err) => toast.error(errorText(err)),
  });

  if (isLoading) {
    return (
      <section className="pt-6">
        <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> {t("rs.loadingSurcharge")}
        </div>
      </section>
    );
  }

  const bothZero = Number(adult) === 0 && Number(kid) === 0;

  return (
    <section className="pt-6">
      <div
        className={`rounded-2xl border bg-card overflow-hidden transition-all max-w-3xl ${
          dirty ? "border-gold/50 shadow-luxe" : "border-border"
        }`}
      >
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gold/15 grid place-items-center shrink-0">
            <Globe className="size-4.5 text-gold-text" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base leading-tight truncate">
              {t("rs.foreignerTitle")}
            </div>
            <div className="text-[10px] text-muted-foreground">{t("rs.foreignerHint")}</div>
          </div>
          {lock.editing ? (
            dirty && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
                {t("common.unsaved")}
              </span>
            )
          ) : (
            <EditButton onClick={lock.start} />
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-5 items-start">
            <MoneyField
              label={t("rs.perForeignAdult")}
              value={adult}
              onChange={(value) => setDraft({ adult: value, kid })}
              disabled={!lock.editing}
              placeholder="0.00"
              hint={t("rs.foreignAdultHint")}
            />
            <MoneyField
              label={t("rs.perForeignChild")}
              value={kid}
              onChange={(value) => setDraft({ adult, kid: value })}
              disabled={!lock.editing}
              placeholder="0.00"
              hint={t("rs.foreignChildHint")}
            />
          </div>

          {/* What the numbers above actually mean, in words, updating as they
              change. It replaces a paragraph of standing instructions that
              described every case at once — including the ones not in force. */}
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
            {bothZero ? (
              <>
                <strong className="text-foreground">{t("rs.noSurchargeNow")}</strong>{" "}
                {t("rs.noSurchargeBody")}
              </>
            ) : (
              t("rs.surchargeBody", {
                adult: money(adult || "0", lang),
                kid: money(kid || "0", lang),
              })
            )}
          </div>
        </div>

        <div className="px-5 pb-5 flex items-center justify-between gap-4 flex-wrap">
          {/* The reassurance that makes a global rate safe to touch: staff need
              to know an edit cannot reach money already collected. */}
          <span className="text-[10px] text-muted-foreground">{t("rs.newBookingsOnly")}</span>
          {lock.editing && (
            <div className="flex items-center gap-2 shrink-0">
              <CancelButton onClick={lock.cancel} />
              <button
                onClick={() => mutation.mutate()}
                disabled={!dirty || mutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold shadow-luxe disabled:opacity-30 disabled:shadow-none"
              >
                {mutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {t("common.save")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function KidPricingSection() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "kid-rules"],
    queryFn: getStaffKidRules,
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["staff", "kid-rules"] });

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<StaffKidRule> }) => {
      setSavingId(id);
      return updateStaffKidRule(id, payload);
    },
    onSuccess: () => {
      toast.success(t("rs.ruleUpdated"));
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  const createMutation = useMutation({
    mutationFn: createStaffKidRule,
    onSuccess: () => {
      toast.success(t("rs.ruleAdded"));
      setShowAdd(false);
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffKidRule,
    onSuccess: () => {
      toast.success(t("rs.ruleDeleted"));
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <section className="space-y-4 pt-6">
      {isLoading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> {t("rs.loadingKidRules")}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-muted-foreground">
            <Info className="size-4 text-gold shrink-0 mt-0.5" />
            <p>
              {t("rs.ageRuleNote1")}{" "}
              <strong className="text-foreground">{t("rs.ageRuleNoteBold")}</strong>
              {t("rs.ageRuleNote2")}
            </p>
          </div>

          {data && data.length > 0 && <AgeTimeline rules={data} />}

          <div className="flex items-center justify-between">
            <span className="eyebrow text-muted-foreground text-[10px]">
              {t("rs.ruleCount", { n: num(data?.length ?? 0, lang) })}
            </span>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe"
            >
              <Plus className="size-3.5" />
              {t("rs.addRule")}
            </button>
          </div>

          {showAdd && (
            <AddKidRuleForm
              saving={createMutation.isPending}
              onCancel={() => setShowAdd(false)}
              onCreate={(payload) => createMutation.mutate(payload)}
            />
          )}

          {(!data || data.length === 0) && !showAdd && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {t("rs.noKidRules1")} <strong>{t("rs.addRule")}</strong> {t("rs.noKidRules2")}
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.map((rule) => (
              <KidRuleCard
                key={rule.id}
                rule={rule}
                saving={savingId === rule.id && mutation.isPending}
                deleting={deleteMutation.isPending && deleteMutation.variables === rule.id}
                onSave={(payload) => mutation.mutate({ id: rule.id, payload })}
                onDelete={() => {
                  if (confirm(t("rs.confirmDeleteRule"))) deleteMutation.mutate(rule.id);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Form to add a new kid pricing rule. Charge type drives whether an amount is
 * required (fixed only) — mirrors the backend serializer's validation. */
function AddKidRuleForm({
  onCreate,
  onCancel,
  saving,
}: {
  onCreate: (payload: Omit<StaffKidRule, "id">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const t = useT();
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(3);
  const [chargeType, setChargeType] = useState<KidChargeType>("free");
  const [amount, setAmount] = useState("");
  const isFixed = chargeType === "fixed";
  const valid = maxAge > minAge && (!isFixed || amount !== "");

  return (
    <div className="rounded-2xl border border-gold/50 bg-card shadow-luxe p-5 space-y-4">
      <div className="font-display text-base">{t("rs.newKidRule")}</div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            {t("rs.ageFrom")}
          </span>
          <input
            type="number"
            min={0}
            value={minAge}
            onChange={(e) => setMinAge(Number(e.target.value))}
            className={staffInputClass}
          />
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            {t("rs.ageTo")}
          </span>
          <input
            type="number"
            min={1}
            value={maxAge}
            onChange={(e) => setMaxAge(Number(e.target.value))}
            className={staffInputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
          {t("rs.chargeType")}
        </span>
        <select
          value={chargeType}
          onChange={(e) => setChargeType(e.target.value as KidChargeType)}
          className={staffInputClass}
        >
          <option value="free">{t("rs.freeNoCharge")}</option>
          <option value="fixed">{t("rs.fixedCharge")}</option>
          <option value="full_adult">{t("rs.fullAdultFare")}</option>
        </select>
      </label>

      {isFixed && (
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            {t("rs.chargePerKid")}
          </span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${staffInputClass} pl-8`}
            />
          </div>
        </label>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold border border-border text-muted-foreground"
        >
          {t("common.cancel")}
        </button>
        <button
          disabled={!valid || saving}
          onClick={() =>
            onCreate({
              min_age: minAge,
              max_age: maxAge,
              charge_type: chargeType,
              amount: isFixed ? amount : null,
            })
          }
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          {t("rs.addRule")}
        </button>
      </div>
    </div>
  );
}

/* ── Room photos ──────────────────────────────────────────────────────────── */

function RoomPhotosSection() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ["staff", "rooms"],
    queryFn: () => getStaffRooms(1),
  });
  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ["staff", "room-images"],
    queryFn: () => getStaffRoomImages(),
  });
  const [search, setSearch] = useState("");
  const [openRoomId, setOpenRoomId] = useState<number | null>(null);

  const byRoom = useMemo(() => {
    const map = new Map<number, StaffRoomImage[]>();
    for (const img of images ?? []) {
      const list = map.get(img.room);
      if (list) list.push(img);
      else map.set(img.room, [img]);
    }
    return map;
  }, [images]);

  const floors = useMemo(() => {
    const all = roomsData?.results ?? [];
    const q = search.trim().toLowerCase();
    const filtered = q ? all.filter((r) => r.room_number.toLowerCase().includes(q)) : all;
    const grouped = new Map<number | null, StaffRoom[]>();
    for (const room of filtered) {
      const list = grouped.get(room.floor_number);
      if (list) list.push(room);
      else grouped.set(room.floor_number, [room]);
    }
    return [...grouped.entries()].sort(
      (a, b) => (a[0] === null ? 1 : 0) - (b[0] === null ? 1 : 0) || (a[0] ?? 0) - (b[0] ?? 0),
    );
  }, [roomsData, search]);

  const openRoom = (roomsData?.results ?? []).find((r) => r.id === openRoomId) ?? null;

  if (roomsLoading || imagesLoading) {
    return (
      <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-gold" /> {t("rs.loadingPhotos")}
      </div>
    );
  }

  return (
    <section className="space-y-5 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("rs.findRoom")}
          className={`${staffInputClass} max-w-xs`}
        />
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground max-w-md">
          <Info className="size-3.5 text-gold shrink-0 mt-0.5" />
          <p>{t("rs.photosNote")}</p>
        </div>
      </div>

      {floors.map(([floor, floorRooms]) => {
        const photoCount = floorRooms.reduce((sum, r) => sum + (byRoom.get(r.id)?.length ?? 0), 0);
        return (
          <div key={floor ?? "none"} className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <span className="eyebrow text-muted-foreground text-[10px]">
                {floor === null ? t("rs.unassignedFloor") : t("rs.floorN", { n: num(floor, lang) })}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t("rs.roomPhotoCount", {
                  rooms: num(floorRooms.length, lang),
                  photos: num(photoCount, lang),
                })}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {floorRooms.map((room) => (
                <RoomPhotoTile
                  key={room.id}
                  room={room}
                  images={byRoom.get(room.id) ?? []}
                  onOpen={() => setOpenRoomId(room.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {floors.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {t("rs.noRoomsMatch", { q: search })}
        </div>
      )}

      {openRoom && (
        <RoomGalleryDialog
          room={openRoom}
          images={byRoom.get(openRoom.id) ?? []}
          onClose={() => setOpenRoomId(null)}
          invalidate={() => queryClient.invalidateQueries({ queryKey: ["staff", "room-images"] })}
        />
      )}
    </section>
  );
}

/** Compact grid tile: cover photo (or placeholder), room number, photo count.
 * All management happens in the dialog — the grid stays scannable. */
function RoomPhotoTile({
  room,
  images,
  onOpen,
}: {
  room: StaffRoom;
  images: StaffRoomImage[];
  onOpen: () => void;
}) {
  const { t, lang } = useLanguage();
  const cover = images[0];
  return (
    <button
      onClick={onOpen}
      className="group text-left rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-gold/50 hover:shadow-luxe focus:outline-none focus-visible:border-gold"
    >
      <div className="relative h-28 bg-ocean/5">
        {cover ? (
          <img
            src={cover.image_url}
            alt={`Room ${room.room_number}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full grid place-items-center text-ocean/25">
            <Images className="size-7" />
          </div>
        )}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
            images.length ? "bg-black/55 text-white" : "bg-amber-100/95 text-amber-700"
          }`}
        >
          {images.length
            ? t("rs.photoCount", { n: num(images.length, lang) })
            : t("rs.noPhotosBadge")}
        </span>
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-ocean text-[10px] font-semibold uppercase tracking-[0.12em]">
            <ImagePlus className="size-3" /> {t("common.manage")}
          </span>
        </div>
      </div>
      <div className="px-3.5 py-2.5">
        <div className="font-display text-base leading-none">
          {t("rs.roomN", { n: room.room_number })}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 truncate">{room.room_type_name}</div>
      </div>
    </button>
  );
}

/** Full gallery editor for one room, in a dialog: upload, reorder, caption, delete. */
function RoomGalleryDialog({
  room,
  images,
  onClose,
  invalidate,
}: {
  room: StaffRoom;
  images: StaffRoomImage[];
  onClose: () => void;
  invalidate: () => void;
}) {
  const { t, lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setUploading(true);
      const nextOrder = images.length ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
      // Sequential, so sort_order stays deterministic and one failure
      // doesn't abort the files already uploaded.
      for (const [i, file] of files.entries()) {
        await uploadStaffRoomImage({ room: room.id, file, sort_order: nextOrder + i });
      }
      return files.length;
    },
    onSuccess: (count) => {
      toast.success(t("rs.photosAdded", { count: num(count, lang), room: room.room_number }));
      invalidate();
    },
    onError: (err) => {
      toast.error(errorText(err));
      invalidate(); // some files may have landed before the failure
    },
    onSettled: () => setUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffRoomImage,
    onSuccess: () => {
      toast.success(t("rs.photoDeleted"));
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const captionMutation = useMutation({
    mutationFn: ({ id, caption }: { id: number; caption: string }) =>
      updateStaffRoomImage(id, { caption }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  const moveMutation = useMutation({
    // Reassign sequential sort_orders with `index` and its neighbour swapped —
    // robust even when existing sort_orders are all 0 or have gaps.
    mutationFn: async ({ index, dir }: { index: number; dir: -1 | 1 }) => {
      const order = [...images];
      const target = index + dir;
      [order[index], order[target]] = [order[target], order[index]];
      await Promise.all(
        order
          .map((img, i) =>
            img.sort_order === i ? null : updateStaffRoomImage(img.id, { sort_order: i }),
          )
          .filter(Boolean),
      );
    },
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell wide title={t("rs.roomPhotosTitle", { n: room.room_number })} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {room.room_type_name}
            {room.floor_number
              ? ` · ${t("rs.floorN", { n: num(room.floor_number, lang) })}`
              : ""} · {t("rs.galleryNote", { photos: num(images.length, lang) })}
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
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ImagePlus className="size-3.5" />
            )}
            {t("rs.addPhotos")}
          </button>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, index) => (
              <figure key={img.id} className="space-y-1.5">
                <div className="relative group rounded-xl overflow-hidden border border-border">
                  <img
                    src={img.image_url}
                    alt={img.caption || t("rs.roomN", { n: room.room_number })}
                    className="h-32 w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 left-1.5 size-5 grid place-items-center rounded-full bg-black/55 text-white text-[9px] font-semibold">
                    {num(index + 1, lang)}
                  </span>
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      title={t("rs.showEarlier")}
                      disabled={index === 0 || moveMutation.isPending}
                      onClick={() => moveMutation.mutate({ index, dir: -1 })}
                      className="size-7 grid place-items-center rounded-lg bg-white/90 text-ocean disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      title={t("rs.showLater")}
                      disabled={index === images.length - 1 || moveMutation.isPending}
                      onClick={() => moveMutation.mutate({ index, dir: 1 })}
                      className="size-7 grid place-items-center rounded-lg bg-white/90 text-ocean disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <button
                      title={t("rs.deletePhoto")}
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(t("rs.confirmDeletePhoto"))) deleteMutation.mutate(img.id);
                      }}
                      className="size-7 grid place-items-center rounded-lg bg-white/90 text-destructive disabled:opacity-40"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <CaptionInput
                  key={`${img.id}-${img.caption}`}
                  initial={img.caption}
                  onSave={(caption) => captionMutation.mutate({ id: img.id, caption })}
                />
              </figure>
            ))}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-border hover:border-gold/50 transition-colors p-10 text-center text-sm text-muted-foreground"
          >
            <Images className="size-8 mx-auto mb-2 text-ocean/25" />
            {t("rs.noPhotos")}
            <span className="block mt-1 text-xs text-gold font-medium">{t("rs.uploadFirst")}</span>
          </button>
        )}
      </div>
    </DialogShell>
  );
}

/** Uncontrolled-ish caption field: saves on blur/Enter only when changed. */
function CaptionInput({ initial, onSave }: { initial: string; onSave: (caption: string) => void }) {
  const t = useT();
  const [value, setValue] = useState(initial);
  const commit = () => {
    if (value.trim() !== initial) onSave(value.trim());
  };
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      placeholder={t("rs.captionOptional")}
      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-gold"
    />
  );
}

/** Solid segment color per charge type — mirrors CHARGE_META badges. */
const CHARGE_BAR: Record<KidChargeType, string> = {
  free: "bg-emerald-500",
  fixed: "bg-gold",
  full_adult: "bg-ocean",
};

/** Visual timeline of how the kid-pricing rules tile across ages 0→AXIS_MAX.
 * Surfaces gaps and overlaps that are hard to see as three number pairs. */
function AgeTimeline({ rules }: { rules: StaffKidRule[] }) {
  const { t, lang } = useLanguage();
  const AXIS_MAX = 18;
  const ordered = useMemo(() => [...rules].sort((a, b) => a.min_age - b.min_age), [rules]);

  // Detect coverage gaps between consecutive (sorted) rules within the axis.
  const gaps = useMemo(() => {
    const out: { from: number; to: number }[] = [];
    let cursor = 0;
    for (const r of ordered) {
      if (r.min_age > cursor) out.push({ from: cursor, to: Math.min(r.min_age, AXIS_MAX) });
      cursor = Math.max(cursor, r.max_age);
    }
    return out;
  }, [ordered]);

  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / AXIS_MAX) * 100))}%`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-muted-foreground text-[10px]">{t("rs.ageCoverage")}</span>
        {gaps.length > 0 ? (
          <span className="text-[10px] font-semibold text-destructive">
            {t("rs.gapsFound", { n: num(gaps.length, lang) })}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-emerald-600">
            {t("rs.fullyCovered", { max: num(AXIS_MAX, lang) })}
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-9 rounded-lg bg-muted/60 overflow-hidden">
        {gaps.map((g, i) => (
          <div
            key={`gap-${i}`}
            className="absolute inset-y-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-destructive)_5px,var(--color-destructive)_6px)] opacity-30"
            style={{ left: pct(g.from), width: pct(g.to - g.from) }}
            title={t("rs.noRuleForAges", { from: num(g.from, lang), to: num(g.to, lang) })}
          />
        ))}
        {ordered.map((r) => {
          const left = pct(r.min_age);
          const width = pct(Math.min(r.max_age, AXIS_MAX) - r.min_age);
          return (
            <div
              key={r.id}
              className={`absolute inset-y-1 rounded-md ${CHARGE_BAR[r.charge_type]} grid place-items-center text-[9px] font-semibold text-white/95 overflow-hidden`}
              style={{ left, width }}
              title={`${t(CHARGE_META[r.charge_type].label)}: ${r.min_age}–${r.max_age}`}
            >
              {num(r.min_age, lang)}–{num(r.max_age, lang)}
            </div>
          );
        })}
      </div>

      {/* Axis ticks */}
      <div className="relative h-4 mt-1">
        {[0, 3, 6, 9, 12, 15, 18].map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 text-[9px] text-muted-foreground"
            style={{ left: pct(tick) }}
          >
            {num(tick, lang)}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        {(Object.keys(CHARGE_BAR) as KidChargeType[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${CHARGE_BAR[k]}`} />
            {t(CHARGE_META[k].label)}
          </span>
        ))}
      </div>
    </div>
  );
}

function KidRuleCard({
  rule,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  rule: StaffKidRule;
  onSave: (payload: Partial<StaffKidRule>) => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  const { t, lang } = useLanguage();
  const [minAge, setMinAge] = useState(rule.min_age);
  const [maxAge, setMaxAge] = useState(rule.max_age);
  const [amount, setAmount] = useState(rule.amount ?? "");
  const lock = useEditLock(() => {
    setMinAge(rule.min_age);
    setMaxAge(rule.max_age);
    setAmount(rule.amount ?? "");
  });
  const dirty =
    minAge !== rule.min_age || maxAge !== rule.max_age || (rule.amount ?? "") !== amount;
  const meta = CHARGE_META[rule.charge_type];
  const isFixed = rule.charge_type === "fixed";
  const MetaIcon = meta.icon;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-luxe ${
        dirty ? "border-gold/50 shadow-luxe" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <MetaIcon className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight">{t(meta.label)}</div>
          <div className="text-[10px] text-muted-foreground">{t(meta.hint)}</div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${meta.badge}`}>
          {t("rs.yrs", { from: num(minAge, lang), to: num(maxAge, lang) })}
        </span>
        {lock.editing ? (
          <button
            onClick={onDelete}
            disabled={deleting}
            title={t("rs.deleteRule")}
            className="size-7 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </button>
        ) : (
          <EditButton onClick={lock.start} />
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              {t("rs.ageFrom")}
            </span>
            <input
              type="number"
              min={0}
              value={minAge}
              disabled={!lock.editing}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setMinAge(Number(e.target.value))}
              className={`${staffInputClass} disabled:bg-muted/50 disabled:text-muted-foreground`}
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              {t("rs.ageTo")}
            </span>
            <input
              type="number"
              min={1}
              value={maxAge}
              disabled={!lock.editing}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className={`${staffInputClass} disabled:bg-muted/50 disabled:text-muted-foreground`}
            />
          </label>
        </div>

        {isFixed && (
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              {t("rs.chargePerKid")}
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <input
                type="number"
                min={0}
                value={amount}
                disabled={!lock.editing}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setAmount(e.target.value)}
                className={`${staffInputClass} pl-8 disabled:bg-muted/50 disabled:text-muted-foreground`}
              />
            </div>
          </label>
        )}

        {lock.editing && (
          <div className="flex items-center gap-2">
            <CancelButton onClick={lock.cancel} />
            <button
              disabled={!dirty || saving}
              onClick={() => {
                onSave({
                  min_age: minAge,
                  max_age: maxAge,
                  ...(isFixed ? { amount: String(amount) } : {}),
                });
                lock.done();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-30 disabled:shadow-none"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {t("common.save")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** What this cabin actually costs, worked out from the ship's fare basis.
 *
 *  Staff were left to multiply berths by the adult fare in their heads, which
 *  is how "max adults" gets edited by someone who does not realise it moves
 *  money. It updates live as the boxes above it change, so the consequence is
 *  visible before Save, not after.
 *
 *  Explicitly "at the default fare": a real sailing can be priced differently,
 *  and this must not read as a promise about any particular package. */
function CabinFarePreview({
  basePrice,
  maxAdults,
  maxKids,
  adultFare,
  berthAllowance,
}: {
  basePrice: string;
  maxAdults: number;
  maxKids: number;
  adultFare: string | null;
  berthAllowance: string | null;
}) {
  const { t, lang } = useLanguage();
  const bdt = (amount: number) => money(String(amount), lang);
  const pax = t("rs.upToPax", { n: num(maxAdults + maxKids, lang) });

  if (!adultFare) {
    return (
      <div className="rounded-xl bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        {t("rs.setFareFirst", { pax })}
      </div>
    );
  }

  const base = Number(basePrice || 0);
  const perAdult = Number(adultFare);

  if (berthAllowance === null) {
    return (
      <div className="rounded-xl bg-muted/40 px-4 py-2.5 text-xs space-y-1">
        <Row
          label={t("rs.adultsN", { n: num(maxAdults, lang) })}
          value={bdt(base + perAdult * maxAdults)}
          strong
        />
        <div className="text-[10px] text-muted-foreground">{t("rs.perHeadNote", { pax })}</div>
      </div>
    );
  }

  const full = base + perAdult * maxAdults;
  const oneEmpty = Math.max(0, full - Number(berthAllowance));

  return (
    <div className="rounded-xl bg-muted/40 px-4 py-2.5 text-xs space-y-1">
      <Row label={t("rs.fullCabin", { berths: num(maxAdults, lang) })} value={bdt(full)} strong />
      {maxAdults > 1 && <Row label={t("rs.oneBerthEmpty")} value={bdt(oneEmpty)} />}
      <div className="text-[10px] text-muted-foreground pt-0.5">
        {t("rs.atDefaultFare", { fare: money(adultFare, lang), pax })}
      </div>
    </div>
  );
}

/** The amount arrives already formatted: only the caller knows the reader
 *  language, and a row that reformatted it would print Bangla digits beside
 *  English ones. */
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

/** The two numbers every cabin on the ship is priced from, in one card above
 *  the cabins themselves.
 *
 *  They were a separate page, then a separate tab, and both were wrong: what a
 *  cabin costs is the first thing anyone opening Room Types wants, and these
 *  two settings decide it. One Save for both, because nobody changes the fare
 *  basis by halves.
 */
function FareBasisCard({ ship }: { ship: StaffShip }) {
  const t = useT();
  const queryClient = useQueryClient();
  const [fare, setFare] = useState(ship.default_adult_price ?? "");
  const [whole, setWhole] = useState(ship.meal_allowance !== null);
  const [allowance, setAllowance] = useState(ship.meal_allowance ?? "");
  const lock = useEditLock(() => {
    setFare(ship.default_adult_price ?? "");
    setWhole(ship.meal_allowance !== null);
    setAllowance(ship.meal_allowance ?? "");
  });

  const nextFare = fare.trim() === "" ? null : fare;
  // Null and "0" are different answers — "sell whole cabins, allow nothing
  // back" has to be expressible — so the toggle and the amount stay separate.
  const nextAllowance = whole ? (allowance.trim() === "" ? "0" : allowance) : null;

  const sameNumber = (a: string | null, b: string | null) =>
    a === null || b === null ? a === b : Number(a) === Number(b);
  const dirty =
    !sameNumber(nextFare, ship.default_adult_price) ||
    !sameNumber(nextAllowance, ship.meal_allowance);

  const mutation = useMutation({
    mutationFn: () =>
      updateStaffShip(ship.id, {
        default_adult_price: nextFare,
        meal_allowance: nextAllowance,
      }),
    onSuccess: () => {
      toast.success(t("rs.fareBasisSaved"));
      lock.done();
      queryClient.invalidateQueries({ queryKey: ["staff", "ships"] });
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all ${
        dirty ? "border-gold/50 shadow-luxe" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-gold/15 grid place-items-center shrink-0">
          <Wallet className="size-4.5 text-gold-text" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight truncate">
            {t("rs.fareBasis")} · {ship.name}
          </div>
          <div className="text-[10px] text-muted-foreground">{t("rs.fareBasisHint")}</div>
        </div>
        {lock.editing ? (
          dirty && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
              {t("common.unsaved")}
            </span>
          )
        ) : (
          <EditButton onClick={lock.start} />
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* The switch sits above both boxes, not beside one of them: it decides
            whether the second box exists at all, and reading it first is the
            only order that makes sense. */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={whole}
            disabled={!lock.editing}
            onChange={(e) => setWhole(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-gold disabled:opacity-60"
          />
          <span className="text-sm leading-snug">
            {t("rs.sellWhole")}
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              {t("rs.sellWholeHint")}
            </span>
          </span>
        </label>

        {/* The two amounts on one row, so they line up and read as the pair
            they are — what a berth costs, and what an empty one gives back. */}
        <div className="grid md:grid-cols-2 gap-5 items-start">
          <MoneyField
            label={t("rs.defaultAdultFare")}
            value={fare}
            onChange={setFare}
            disabled={!lock.editing}
            placeholder="20000"
            hint={t("rs.defaultAdultFareHint")}
          />
          {whole && (
            <MoneyField
              label={t("rs.allowance")}
              value={allowance}
              onChange={setAllowance}
              disabled={!lock.editing}
              placeholder="5000"
              hint={t("rs.allowanceHint")}
            />
          )}
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between gap-4 flex-wrap">
        <span className="text-[10px] text-muted-foreground">{t("rs.newBookingsOnly")}</span>
        {lock.editing && (
          <div className="flex items-center gap-2">
            <CancelButton onClick={lock.cancel} />
            <button
              disabled={!dirty || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-30 disabled:shadow-none inline-flex items-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {t("rs.saveFareBasis")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** A taka amount with its label and its one line of explanation. Two of these
 *  side by side stay the same height and keep their hints aligned, which hand
 *  written pairs of the same markup did not. */
function MoneyField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ৳
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          // A number input changes on a mouse wheel over it, which is exactly
          // how a fare gets edited by someone who was only scrolling past.
          onWheel={(e) => e.currentTarget.blur()}
          onChange={(e) => onChange(e.target.value)}
          className={`${staffInputClass} pl-8 disabled:bg-muted/50 disabled:text-muted-foreground`}
        />
      </div>
      <span className="mt-1.5 block text-[10px] text-muted-foreground leading-snug">{hint}</span>
    </label>
  );
}
