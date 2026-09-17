import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Languages,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Ship as ShipIcon,
  UserRound,
} from "lucide-react";

import { PageHeader, errorText, staffInputClass } from "@/components/staff/ui";
import { getStaffShips, updateStaffShip } from "@/lib/api/staff";
import { useLanguage, useT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n/strings";
import { getStaffUser } from "@/lib/staffAuth";
import type { GuideReportDensity, StaffShip } from "@/lib/api/staffTypes";

export const Route = createFileRoute("/staff/settings")({
  component: SettingsPage,
});

/** The page's own contents, in the order they appear, so the side rail and the
 *  body cannot drift apart. Fare policy is deliberately NOT here — it lives on
 *  Room Settings, where staff go to change what things cost. */
const SECTIONS: { id: string; label: StringKey; icon: LucideIcon }[] = [
  { id: "account", label: "st.account", icon: UserRound },
  { id: "language", label: "st.language", icon: Languages },
  { id: "inbox", label: "st.contactInbox", icon: Mail },
  { id: "helpline", label: "st.helpline", icon: Phone },
  { id: "report", label: "st.guideReport", icon: FileText },
];

function SettingsPage() {
  const t = useT();
  const user = getStaffUser();
  const initial = (user?.first_name || user?.username || "S").charAt(0).toUpperCase();

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title={t("st.title")} subtitle={t("st.subtitle")} />

      {/* A row, not a left rail: these are five short groups, and a horizontal
          index reads the same way as the tabs on Room Settings — one dashboard,
          one idea of what a section switcher looks like. It scrolls sideways on
          a phone rather than wrapping into a block of its own. */}
      <nav
        aria-label={t("st.sections")}
        className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-border pb-px"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon className="size-4 shrink-0 text-gold" />
            {t(label)}
          </a>
        ))}
      </nav>

      <div className="mt-8 max-w-2xl space-y-10">
        <section id="account" className="scroll-mt-8 space-y-4">
          <SectionHeading icon={UserRound} title={t("st.account")} hint={t("st.accountHint")} />

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center gap-4">
              <div className="size-14 rounded-full gradient-gold grid place-items-center shrink-0">
                <span className="font-display text-xl text-ocean">{initial}</span>
              </div>
              <div className="min-w-0">
                <div className="font-display text-xl leading-tight truncate">
                  {user?.first_name || user?.username || t("st.staff")}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  @{user?.username ?? "—"}
                </div>
              </div>
            </div>

            <div className="divide-y divide-border">
              <ProfileRow icon={UserRound} label={t("st.username")} value={user?.username ?? "—"} />
              <ProfileRow
                icon={ShieldCheck}
                label={t("st.role")}
                value={user?.is_staff ? t("st.roleStaff") : "—"}
              />
            </div>

            <div className="px-6 py-3 bg-muted/40 border-t border-border text-[11px] text-muted-foreground">
              {t("st.accountNote")}
            </div>
          </div>
        </section>

        <section id="language" className="scroll-mt-8">
          <LanguageSection />
        </section>
        <section id="inbox" className="scroll-mt-8">
          <NotificationInboxSection />
        </section>
        <section id="helpline" className="scroll-mt-8">
          <HelplineSection />
        </section>
        <section id="report" className="scroll-mt-8">
          <GuideReportSection />
        </section>
      </div>
    </div>
  );
}

/** One heading style for every group on the page, so five unrelated settings
 *  do not each announce themselves differently. */
function SectionHeading({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  return (
    <div>
      <h2 className="font-display text-xl flex items-center gap-2">
        <Icon className="size-5 text-gold" /> {title}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

/* ── Dashboard language ───────────────────────────────────────────────────── */

const LANG_OPTIONS: { value: Lang; label: StringKey; hint: StringKey }[] = [
  { value: "en", label: "st.langEnglish", hint: "st.langEnglishHint" },
  { value: "bn", label: "st.langBangla", hint: "st.langBanglaHint" },
];

/** The toast has to speak the language just chosen, not the one being left —
 *  t() still holds the old language while this click is being handled. */
const LANG_CHANGED: Record<Lang, string> = {
  en: "Language changed — it stays this way on this computer.",
  bn: "ভাষা বদলানো হয়েছে — এই কম্পিউটারে এভাবেই থাকবে।",
};

/** No Save button, unlike the ship settings below it: this is a browser
 *  preference, not a record on the server, and the whole dashboard redraws in
 *  the chosen language the moment it is picked — which is the confirmation. */
function LanguageSection() {
  const { t, lang, setLang } = useLanguage();

  function choose(next: Lang) {
    if (next === lang) return;
    setLang(next);
    toast.success(LANG_CHANGED[next]);
  }

  return (
    <section className="space-y-4">
      <SectionHeading icon={Languages} title={t("st.language")} hint={t("st.languageHint")} />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
            <Languages className="size-4.5 text-ocean" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base leading-tight truncate">
              {t("st.languageDashboard")}
            </div>
            <div className="text-[10px] text-muted-foreground">{t("shell.dashboard")}</div>
          </div>
        </div>

        <div className="p-5">
          <div role="group" aria-label={t("st.language")} className="grid grid-cols-2 gap-2">
            {LANG_OPTIONS.map((opt) => {
              const active = lang === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => choose(opt.value)}
                  aria-pressed={active}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${
                    active
                      ? "border-gold bg-ocean/4 shadow-[0_0_0_1px_var(--gold)]"
                      : "border-border hover:border-gold/50"
                  }`}
                >
                  <span className="block text-sm font-semibold">{t(opt.label)}</span>
                  <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5">
                    {t(opt.hint)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3 bg-muted/40 border-t border-border text-[11px] text-muted-foreground">
          {t("st.languageNote")}
        </div>
      </div>
    </section>
  );
}

/* ── Contact-form notification inbox ──────────────────────────────────────── */

function NotificationInboxSection() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "ships"],
    queryFn: getStaffShips,
  });
  const [savingId, setSavingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, contact_notify_email }: { id: number; contact_notify_email: string }) => {
      setSavingId(id);
      return updateStaffShip(id, { contact_notify_email });
    },
    onSuccess: () => {
      toast.success(t("st.inboxSaved"));
      queryClient.invalidateQueries({ queryKey: ["staff", "ships"] });
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  return (
    <section className="space-y-4">
      <SectionHeading icon={Mail} title={t("st.messageNotifications")} hint={t("st.inboxHint")} />

      {isLoading ? (
        <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> {t("common.loading")}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((ship) => (
            <ShipNotifyCard
              key={ship.id}
              ship={ship}
              saving={savingId === ship.id && mutation.isPending}
              onSave={(contact_notify_email) =>
                mutation.mutate({ id: ship.id, contact_notify_email })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShipNotifyCard({
  ship,
  onSave,
  saving,
}: {
  ship: StaffShip;
  onSave: (email: string) => void;
  saving: boolean;
}) {
  const t = useT();
  const [value, setValue] = useState(ship.contact_notify_email);
  const dirty = value.trim() !== ship.contact_notify_email.trim();

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all ${
        dirty ? "border-gold/50 shadow-luxe" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <ShipIcon className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight truncate">{ship.name}</div>
          <div className="text-[10px] text-muted-foreground">{t("st.contactNotifications")}</div>
        </div>
        {dirty && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
            {t("common.unsaved")}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            {t("st.notificationEmail")}
          </span>
          <input
            type="email"
            value={value}
            placeholder="reservations@mvalaska.com"
            onChange={(e) => setValue(e.target.value)}
            className={staffInputClass}
          />
        </label>

        <button
          disabled={!dirty || saving}
          onClick={() => onSave(value)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {dirty ? t("common.save") : t("common.saved")}
        </button>
      </div>
    </div>
  );
}

/* ── Helpline numbers ─────────────────────────────────────────────────────── */

function HelplineSection() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "ships"],
    queryFn: getStaffShips,
  });
  const [savingId, setSavingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, authority_phones }: { id: number; authority_phones: string }) => {
      setSavingId(id);
      return updateStaffShip(id, { authority_phones });
    },
    onSuccess: () => {
      toast.success(t("st.helplineSaved"));
      queryClient.invalidateQueries({ queryKey: ["staff", "ships"] });
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  return (
    <section className="space-y-4">
      <SectionHeading icon={Phone} title={t("st.helpline")} hint={t("st.helplineHint")} />

      {isLoading ? (
        <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> {t("common.loading")}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((ship) => (
            <ShipHelplineCard
              key={ship.id}
              ship={ship}
              saving={savingId === ship.id && mutation.isPending}
              onSave={(authority_phones) => mutation.mutate({ id: ship.id, authority_phones })}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShipHelplineCard({
  ship,
  onSave,
  saving,
}: {
  ship: StaffShip;
  onSave: (authority_phones: string) => void;
  saving: boolean;
}) {
  const t = useT();
  const [value, setValue] = useState(ship.authority_phones);
  const dirty = value.trim() !== ship.authority_phones.trim();

  // Live preview: how the header line will read (empty input falls back to the
  // system default, mirrored in authority_phone_list from the API).
  const preview = value.trim()
    ? value
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
    : ship.authority_phone_list;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all ${
        dirty ? "border-gold/50 shadow-luxe" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <ShipIcon className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight truncate">{ship.name}</div>
          <div className="text-[10px] text-muted-foreground">{t("st.helplineDoc")}</div>
        </div>
        {dirty && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
            {t("common.unsaved")}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            {t("st.phoneNumbers")}
          </span>
          <input
            type="text"
            value={value}
            placeholder="01712-823482, 01831-694307, 01342-919795"
            onChange={(e) => setValue(e.target.value)}
            className={staffInputClass}
          />
        </label>

        {/* Live preview of the printed line */}
        <div className="rounded-xl bg-muted/40 px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">{t("st.onThePdf")} </span>
          {preview.length > 0 ? (
            <span className="font-medium">
              {t("st.helplineLabel")} {preview.join("  ·  ")}
            </span>
          ) : (
            <span className="italic text-muted-foreground">{t("st.noHelplineLine")}</span>
          )}
        </div>

        <button
          disabled={!dirty || saving}
          onClick={() => onSave(value)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {dirty ? t("common.save") : t("common.saved")}
        </button>
      </div>
    </div>
  );
}

/* ── Guide report size (per-ship density) ─────────────────────────────────── */

const DENSITY_OPTIONS: {
  value: GuideReportDensity;
  label: StringKey;
  hint: StringKey;
}[] = [
  { value: "compact", label: "st.densityCompact", hint: "st.densityCompactHint" },
  { value: "normal", label: "st.densityNormal", hint: "st.densityNormalHint" },
  { value: "large", label: "st.densityLarge", hint: "st.densityLargeHint" },
];

function GuideReportSection() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "ships"],
    queryFn: getStaffShips,
  });
  const [savingId, setSavingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      id,
      guide_report_density,
    }: {
      id: number;
      guide_report_density: GuideReportDensity;
    }) => {
      setSavingId(id);
      return updateStaffShip(id, { guide_report_density });
    },
    onSuccess: () => {
      toast.success(t("st.guideReportSaved"));
      queryClient.invalidateQueries({ queryKey: ["staff", "ships"] });
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  return (
    <section className="space-y-4">
      <SectionHeading
        icon={FileText}
        title={t("st.guideReportSize")}
        hint={t("st.guideReportHint")}
      />

      {isLoading ? (
        <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> {t("common.loading")}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((ship) => (
            <ShipDensityCard
              key={ship.id}
              ship={ship}
              saving={savingId === ship.id && mutation.isPending}
              onSave={(guide_report_density) =>
                mutation.mutate({ id: ship.id, guide_report_density })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShipDensityCard({
  ship,
  onSave,
  saving,
}: {
  ship: StaffShip;
  onSave: (density: GuideReportDensity) => void;
  saving: boolean;
}) {
  const t = useT();
  const [value, setValue] = useState<GuideReportDensity>(ship.guide_report_density);
  const dirty = value !== ship.guide_report_density;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all ${
        dirty ? "border-gold/50 shadow-luxe" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <ShipIcon className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight truncate">{ship.name}</div>
          <div className="text-[10px] text-muted-foreground">{t("st.guideReportDensity")}</div>
        </div>
        {dirty && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
            {t("common.unsaved")}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Segmented control — three density choices */}
        <div className="grid grid-cols-3 gap-2">
          {DENSITY_OPTIONS.map((opt) => {
            const active = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue(opt.value)}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  active
                    ? "border-gold bg-ocean/4 shadow-[0_0_0_1px_var(--gold)]"
                    : "border-border hover:border-gold/50"
                }`}
              >
                <span className="block text-sm font-semibold">{t(opt.label)}</span>
                <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5">
                  {t(opt.hint)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          disabled={!dirty || saving}
          onClick={() => onSave(value)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-luxe disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {dirty ? t("common.save") : t("common.saved")}
        </button>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="px-6 py-4 flex items-center gap-3">
      <Icon className="size-4 text-ocean/50 shrink-0" />
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium truncate">{value}</span>
    </div>
  );
}
