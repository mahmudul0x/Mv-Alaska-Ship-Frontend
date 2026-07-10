import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, UserRound } from "lucide-react";

import { getStaffUser } from "@/lib/staffAuth";

export const Route = createFileRoute("/staff/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = getStaffUser();
  const initial = (user?.first_name || user?.username || "S").charAt(0).toUpperCase();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account on the MV Alaska staff dashboard.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center gap-4">
          <div className="size-14 rounded-full gradient-gold grid place-items-center shrink-0">
            <span className="font-display text-xl text-ocean">{initial}</span>
          </div>
          <div className="min-w-0">
            <div className="font-display text-xl leading-tight truncate">
              {user?.first_name || user?.username || "Staff"}
            </div>
            <div className="text-xs text-muted-foreground truncate">@{user?.username ?? "—"}</div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <ProfileRow icon={UserRound} label="Username" value={user?.username ?? "—"} />
          <ProfileRow
            icon={ShieldCheck}
            label="Role"
            value={user?.is_staff ? "Staff (dashboard access)" : "—"}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        To change your name, username, or password, contact an administrator in the Django
        admin panel.
      </p>
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
