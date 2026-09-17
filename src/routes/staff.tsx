import { useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
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
import { staffLogout } from "@/lib/api/staff";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/70 hover:text-background hover:bg-white/5 transition-colors [&.active]:bg-gold/15 [&.active]:text-gold-soft ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{t(label)}</span>}
            </Link>
          ))}
        </nav>

        {/* Log out only. The language switch lives on Settings — a preference
            set once belongs with the other settings, not in the rail beside a
            button staff press every day. */}
        <div className="p-2 lg:p-3 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            title={collapsed ? t("shell.logout") : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/70 hover:text-destructive hover:bg-white/5 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="size-4.5 shrink-0" />
            {!collapsed && <span>{t("shell.logout")}</span>}
          </button>
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
