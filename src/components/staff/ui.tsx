import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

import type { ApiError, BookingStatus } from "@/lib/api/types";

export function errorText(err: unknown) {
  const apiError = err as ApiError;
  return apiError.fieldErrors
    ? Object.entries(apiError.fieldErrors)
        .map(([k, v]) => `${k}: ${v.join(" ")}`)
        .join(" · ")
    : apiError.detail || "Something went wrong.";
}

export function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ocean/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-luxe w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="size-8 rounded-full grid place-items-center hover:bg-muted">
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

export function StaffField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  partially_paid: "Partially paid",
  fully_paid: "Fully paid",
  cancelled: "Cancelled",
  completed: "Completed",
};

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
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
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
