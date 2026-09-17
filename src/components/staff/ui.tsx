import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

import type { ApiError, BookingStatus } from "@/lib/api/types";
import { tr, useT } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n/strings";

/** Field names whose automatic label would be wrong or unhelpful. Everything
 *  else is derived, so a new field gets a decent label without being listed. */
const FIELD_LABELS: Record<string, StringKey | ""> = {
  ship: "common.ship",
  booking_cutoff_datetime: "err.fieldCutoff",
  min_deposit_percent: "err.fieldMinDeposit",
  balance_due_days_before_start: "err.fieldBalanceDue",
  duration_days: "err.fieldDurationDays",
  duration_nights: "err.fieldDurationNights",
  marketing_title: "err.fieldTitle",
  marketing_description: "err.fieldDescription",
  hero_image: "pk.coverPhoto",
  discount_type: "err.fieldOfferType",
  discount_value: "err.fieldOfferAmount",
  offer_label: "err.fieldOfferName",
  offer_ends_at: "err.fieldOfferEnds",
  is_booking_open: "err.fieldBookingOpen",
  non_field_errors: "",
  detail: "",
};

function labelFor(field: string): string {
  const mapped = FIELD_LABELS[field];
  if (mapped !== undefined) return mapped === "" ? "" : tr(mapped);
  const spaced = field.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** DRF's stock validation sentences, which name no field and read like a
 *  library talking to a programmer. The server's OWN messages are already
 *  written for a person and are left alone.
 *
 *  Only the stock sentences are translated: they are a fixed, known list. A
 *  message our own validation wrote comes back in English from the server, and
 *  guessing at it here would be worse than passing it through. */
function humanise(label: string, message: string): string {
  const named = label || tr("err.thisField");
  const say = (key: StringKey, vars?: Record<string, string | number>) =>
    tr(key, { field: named, ...vars });

  if (message === "This field is required.") return say("err.required");
  if (message === "This field may not be null.") return say("err.required");
  if (message === "This field may not be blank.") return say("err.blank");
  if (message.startsWith("Date has wrong format")) return say("err.badDate");
  if (message.startsWith("Datetime has wrong format")) return say("err.badDateTime");
  if (message === "A valid number is required.") return say("err.notNumber");
  if (message === "A valid integer is required.") return say("err.notWhole");
  // Captured rather than sliced at a character count: counting the prefix by
  // hand is off by one the first time anyone reads it back.
  const atLeast = /^Ensure this value is greater than or equal to (.+?)\.?$/.exec(message);
  if (atLeast) return say("err.tooLow", { min: atLeast[1] });
  const atMost = /^Ensure this value is less than or equal to (.+?)\.?$/.exec(message);
  if (atMost) return say("err.tooHigh", { max: atMost[1] });
  if (message.startsWith('"') && message.includes("is not a valid choice")) {
    return say("err.badChoice");
  }
  if (message === "Not a valid string.") return say("err.notValid");
  // A real sentence from our own validation. Only name the field when the
  // sentence does not already — "End date must be after start date" gains
  // nothing from being introduced as "End date: End date must be…".
  if (!label || message.toLowerCase().startsWith(label.toLowerCase())) return message;
  return `${label}: ${message}`;
}

/** Nothing came back from the server, or nothing worth repeating. Status codes
 *  are not something staff should have to look up. */
const BY_STATUS: Record<number, StringKey> = {
  0: "err.offline",
  401: "err.expired",
  403: "err.forbidden",
  404: "err.gone",
  405: "err.notAllowed",
  413: "err.tooLarge",
  429: "err.tooMany",
  500: "err.serverBroke",
  502: "err.restarting",
  503: "err.restarting",
  504: "err.timeout",
};

/**
 * One sentence a person can act on, from whatever the API returned.
 *
 * Staff see this in a toast and nowhere else, so it has to carry the whole
 * story: which field, what is wrong with it, and — when the server said
 * nothing useful — what is actually happening.
 */
export function errorText(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (!apiError) return tr("common.somethingWrong");

  if (apiError.fieldErrors) {
    const parts = Object.entries(apiError.fieldErrors).flatMap(([field, messages]) =>
      messages.map((message) => humanise(labelFor(field), message)),
    );
    // Toasts are read at a glance. Beyond three problems, the count is more
    // use than the list — the form shows them all anyway.
    if (parts.length > 3) {
      return `${parts.slice(0, 3).join(" ")} ${tr("err.andMore", {
        n: parts.length - 3,
      })}`;
    }
    if (parts.length) return parts.join(" ");
  }

  if (apiError.detail) return apiError.detail;
  return tr(BY_STATUS[apiError.status] ?? "common.somethingWrong");
}

export function DialogShell({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Wider body for media-heavy dialogs (photo galleries etc.). */
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ocean/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-card rounded-2xl shadow-luxe w-full max-h-[85vh] overflow-y-auto ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-xl">{title}</h2>
          <button
            onClick={onClose}
            className="size-8 rounded-full grid place-items-center hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

export function StaffField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export const staffInputClass =
  "w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold";

/* ── Shared status styling (single source of truth) ───────────────────────── */

/** A hook, not a constant: these are read by people, and the dashboard is
 *  bilingual. Kept as one lookup so a status cannot be worded two ways on two
 *  pages. */
export function useStatusLabel(): Record<BookingStatus, string> {
  const t = useT();
  return {
    pending: t("status.pending"),
    partially_paid: t("status.partially_paid"),
    fully_paid: t("status.fully_paid"),
    cancelled: t("status.cancelled"),
    completed: t("status.completed"),
  };
}

/** Pill classes per booking status — muted amber / emerald / red on tinted bg. */
export const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  partially_paid: "bg-amber-100 text-amber-700",
  fully_paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-emerald-100 text-emerald-700",
};

/** Solid dot color per status — for legends / list rows. */
export const STATUS_DOT: Record<BookingStatus, string> = {
  pending: "bg-amber-500",
  partially_paid: "bg-amber-500",
  fully_paid: "bg-emerald-500",
  cancelled: "bg-red-500",
  completed: "bg-emerald-600",
};

export const STATUS_ORDER: BookingStatus[] = [
  "pending",
  "partially_paid",
  "fully_paid",
  "completed",
  "cancelled",
];

/** Package lifecycle status → pill classes (distinct from booking statuses). */
export const PACKAGE_STATUS_STYLE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-amber-100 text-amber-700",
  completed: "bg-ocean/10 text-ocean",
  cancelled: "bg-red-100 text-red-600",
};

export function PackageStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap ${
        PACKAGE_STATUS_STYLE[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const labels = useStatusLabel();
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${STATUS_STYLE[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/* ── Page & section scaffolding ───────────────────────────────────────────── */

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  action,
  bodyClassName = "",
  className = "",
  children,
}: {
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  bodyClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-2">
          <span className="eyebrow text-muted-foreground text-[10px] flex items-center gap-2">
            {Icon && <Icon className="size-3.5 text-ocean/50" />}
            {title}
          </span>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  highlight = false,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: React.ReactNode;
  highlight?: boolean;
  tone?: "default" | "gold" | "emerald" | "destructive";
}) {
  const valueTone =
    tone === "gold"
      ? "text-gold"
      : tone === "emerald"
        ? "text-emerald-600"
        : tone === "destructive"
          ? "text-destructive"
          : "";
  return (
    <div
      className={`group rounded-2xl border p-5 transition-shadow hover:shadow-luxe ${
        highlight ? "border-gold/40 bg-gold/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow text-muted-foreground text-[10px]">{label}</span>
        <span
          className={`size-8 rounded-lg grid place-items-center transition-colors ${
            highlight ? "bg-gold/15 text-gold" : "bg-muted text-ocean/50 group-hover:text-gold"
          }`}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className={`font-display text-3xl mt-3 ${highlight ? "text-gold" : valueTone}`}>
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground mt-1.5">{hint}</div>}
    </div>
  );
}
