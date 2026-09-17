import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Bell,
  CalendarRange,
  ChefHat,
  ChevronLeft,
  ClipboardList,
  DoorOpen,
  Images,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { getStaffNotifications, staffLogout } from "@/lib/api/staff";
import { useQuery } from "@tanstack/react-query";

import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { money, num } from "@/lib/i18n/format";
import type { StringKey } from "@/lib/i18n/strings";
import { clearStaffSession, getRefreshToken, isStaffLoggedIn } from "@/lib/staffAuth";

export const Route = createFileRoute("/staff")({
  // The provider wraps the layout rather than sitting inside it, so the layout
  // itself can call useLanguage() — and so every staff page is inside it
  // without each one remembering to be.
  component: () => (
    <LanguageProvider>
      <StaffLayout />
    </LanguageProvider>
  ),
  beforeLoad: () => {
    if (!isStaffLoggedIn()) {
      throw redirect({ to: "/staff/login" });
    }
  },
  head: () => ({ meta: [{ title: "Staff Dashboard — MV Alaska" }] }),
});

const NAV: { to: string; label: StringKey; icon: LucideIcon; exact: boolean }[] = [
  { to: "/staff", label: "nav.overview", icon: LayoutDashboard, exact: true },
  { to: "/staff/bookings", label: "nav.bookings", icon: ClipboardList, exact: false },
  { to: "/staff/messages", label: "nav.messages", icon: MessageSquare, exact: false },
  { to: "/staff/refunds", label: "nav.refunds", icon: Wallet, exact: false },
  { to: "/staff/packages", label: "nav.packages", icon: CalendarRange, exact: false },
  { to: "/staff/rooms", label: "nav.rooms", icon: BedDouble, exact: false },
  { to: "/staff/cabins", label: "nav.cabins", icon: DoorOpen, exact: false },
  { to: "/staff/gallery", label: "nav.gallery", icon: Images, exact: false },
  { to: "/staff/room-settings", label: "nav.roomSettings", icon: SlidersHorizontal, exact: false },
  { to: "/staff/food-menu", label: "nav.foodMenu", icon: ChefHat, exact: false },
  { to: "/staff/settings", label: "nav.settings", icon: Settings, exact: false },
] as const;

const COLLAPSE_KEY = "staff.sidebar.collapsed";

function StaffLayout() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: notify } = useNotifications();
  // The Refunds page owns both of these, so its badge counts both: a customer
  // waiting on a decision and a payout past the window we promised are the
  // same kind of debt to a person.
  const refundsWaiting =
    (notify?.cancellation_requests.count ?? 0) + (notify?.overdue_refunds.count ?? 0);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function handleLogout() {
    const refresh = getRefreshToken();
    try {
      if (refresh) await staffLogout(refresh);
    } finally {
      clearStaffSession();
      navigate({ to: "/staff/login" });
    }
  }

  // Collapsed = icon rail; expanded = full labels. Fixed to the viewport so the
  // nav never scrolls away; content is offset by a matching margin.
  const width = collapsed ? "w-16" : "w-60";

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 ${width} bg-linear-to-b from-ocean to-midnight text-background flex flex-col transition-[width] duration-300 ease-in-out`}
      >
        {/* The ship's own mark, straight on the dark ground — the same way the
            public navbar carries it. It sat in a gold tile with a stock anchor
            in it, which is a logo for no particular ship.

            Narrower padding when collapsed: the rail is 64px, and px-4 leaves
            32px of it, which is not enough of the mark to recognise. */}
        <div
          className={`h-16 flex items-center gap-3 border-b border-white/10 shrink-0 ${
            collapsed ? "px-2 justify-center" : "px-4"
          }`}
        >
          <img
            src={logo}
            alt="MV Alaska"
            className="size-10 object-contain shrink-0"
            draggable={false}
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-lg leading-none truncate">MV Alaska</div>
              <div className="eyebrow text-gold-soft text-[8px] mt-0.5">{t("shell.dashboard")}</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 lg:px-3 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              title={collapsed ? t(label) : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/70 hover:text-background hover:bg-white/5 transition-colors [&.active]:bg-gold/15 [&.active]:text-gold-soft ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{t(label)}</span>}
              {to === "/staff/refunds" && <NavBadge count={refundsWaiting} collapsed={collapsed} />}
            </Link>
          ))}
        </nav>

        {/* Log out, with the bell beside it. Stacked on the collapsed rail,
            where 64px will not hold two things side by side.

            The language switch is deliberately NOT here — a preference set
            once belongs on Settings, not in the rail beside a button staff
            press every day. */}
        <div
          className={`p-2 lg:p-3 border-t border-white/10 shrink-0 flex items-center gap-1 ${
            collapsed ? "flex-col" : ""
          }`}
        >
          <button
            onClick={handleLogout}
            title={collapsed ? t("shell.logout") : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/70 hover:text-destructive hover:bg-white/5 transition-colors ${
              collapsed ? "justify-center w-full" : "flex-1 min-w-0"
            }`}
          >
            <LogOut className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{t("shell.logout")}</span>}
          </button>
          <NotificationBell />
        </div>

        {/* Collapse / expand toggle — sits on the sidebar's edge */}
        <button
          onClick={toggle}
          title={collapsed ? t("shell.expand") : t("shell.collapse")}
          className="absolute top-13 -right-3 z-50 size-6 rounded-full bg-card border border-border text-ocean grid place-items-center shadow-md hover:text-gold hover:border-gold transition-colors"
        >
          <ChevronLeft
            className={`size-3.5 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>

      {/* Content — offset by the sidebar width */}
      <div
        className={`min-w-0 overflow-x-hidden transition-[margin] duration-300 ease-in-out ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

/** How often the bell re-asks. A minute is often enough that nobody sits on a
 *  stale queue, and rare enough that a dashboard left open all day is not a
 *  traffic source of its own. */
const NOTIFY_POLL_MS = 60_000;

function useNotifications() {
  return useQuery({
    queryKey: ["staff", "notifications"],
    queryFn: getStaffNotifications,
    refetchInterval: NOTIFY_POLL_MS,
    // A tab that has been in the background all afternoon should be current
    // the moment it is looked at again, not a minute later.
    refetchOnWindowFocus: true,
  });
}

/** The count beside a nav item. Nav labels are hidden on the collapsed rail,
 *  so there it becomes a dot on the icon instead — the number would not fit
 *  and the point is only that there IS something. */
function NavBadge({ count, collapsed }: { count: number; collapsed: boolean }) {
  if (!count) return null;
  if (collapsed) {
    return (
      <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-ocean" />
    );
  }
  return (
    <span className="ml-auto shrink-0 min-w-5 px-1.5 h-5 grid place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** The bell, beside Log out.
 *
 *  Everything it lists is a decision someone owes: a customer waiting on a
 *  cancellation, a payout past the window we promised, a payment the gateway
 *  flagged. Each row navigates straight to the thing — a notification you have
 *  to go hunting for after reading it is just a worse version of a number.
 */
function NotificationBell() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useNotifications();

  // Close on outside click / Escape: a popover only its own button can dismiss
  // traps anyone who opens it by accident.
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

  const total = data?.total ?? 0;
  const requests = data?.cancellation_requests.items ?? [];
  const overdue = data?.overdue_refunds.items ?? [];
  const flagged = data?.payments_needing_review.items ?? [];

  return (
    <div ref={ref} className="relative">
      {/* Icon only, at the end of the logout row. The count rides the icon as
          a corner bubble rather than sitting beside a label — there is no
          label, and a bell everyone recognises does not need one. The title
          carries the name for anyone hovering or using a screen reader. */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={
          total > 0
            ? `${t("notif.title")} — ${t("notif.needsYou", { n: num(total, lang) })}`
            : t("notif.title")
        }
        aria-label={t("notif.title")}
        aria-expanded={open}
        className={`relative shrink-0 size-10 grid place-items-center rounded-xl transition-colors ${
          total > 0
            ? "text-gold-soft hover:bg-white/5"
            : "text-background/70 hover:text-background hover:bg-white/5"
        }`}
      >
        <Bell className="size-4.5" />
        {total > 0 && (
          <span className="absolute top-1 right-0.5 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-ocean">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div
          // Upwards and to the right: the bell sits at the bottom of a
          // full-height rail, so a downward popover would open off-screen.
          className="absolute bottom-full left-0 mb-2 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card text-foreground shadow-luxe z-50"
        >
          <div className="px-4 py-3 border-b border-border">
            <div className="font-display text-base leading-none">{t("notif.title")}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {total > 0 ? t("notif.needsYou", { n: num(total, lang) }) : t("notif.allClear")}
            </div>
          </div>

          {total === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("notif.nothing")}
            </div>
          )}

          {requests.length > 0 && (
            <NotifyGroup title={t("notif.groupRequests")}>
              {requests.map((row) => (
                <Link
                  key={row.id}
                  to="/staff/refunds"
                  // Opens that exact request, rather than dropping the reader
                  // on a queue to find it again.
                  search={{ request: row.id }}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-sm truncate">{row.customer_name}</span>
                    <span className="text-xs text-gold-text shrink-0">
                      {money(row.refund_amount, lang)}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {row.booking_code}
                  </div>
                </Link>
              ))}
            </NotifyGroup>
          )}

          {overdue.length > 0 && (
            <NotifyGroup title={t("notif.groupOverdue")}>
              {overdue.map((row) => (
                <Link
                  key={row.id}
                  to="/staff/refunds"
                  search={{ tab: "register" as const }}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-sm truncate">{row.customer_name}</span>
                    <span className="text-xs text-destructive shrink-0">
                      {money(row.amount, lang)}
                    </span>
                  </div>
                  <div className="text-[11px] text-destructive">
                    {t("notif.waitingDays", { n: num(row.age_days, lang) })}
                  </div>
                </Link>
              ))}
            </NotifyGroup>
          )}

          {flagged.length > 0 && (
            <NotifyGroup title={t("notif.groupFlagged")}>
              {flagged.map((row) => (
                <Link
                  key={row.id}
                  to="/staff/refunds"
                  search={{ tab: "review" as const }}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs truncate">{row.booking_code}</span>
                    <span className="text-xs shrink-0">{money(row.amount, lang)}</span>
                  </div>
                  {row.high_risk && (
                    <div className="text-[11px] text-destructive">{t("rv.highRisk")}</div>
                  )}
                </Link>
              ))}
            </NotifyGroup>
          )}
        </div>
      )}
    </div>
  );
}

function NotifyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-0">
      <div className="px-4 pt-3 pb-1 eyebrow text-[9px] text-muted-foreground">{title}</div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
