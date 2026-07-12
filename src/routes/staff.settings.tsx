import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Phone, Save, ShieldCheck, Ship as ShipIcon, UserRound } from "lucide-react";

import { errorText, staffInputClass } from "@/components/staff/ui";
import { getStaffShips, updateStaffShip } from "@/lib/api/staff";
import { getStaffUser } from "@/lib/staffAuth";
import type { StaffShip } from "@/lib/api/staffTypes";

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
          Your account and document settings on the MV Alaska staff dashboard.
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

      <HelplineSection />
    </div>
  );
}

/* ── Helpline numbers ─────────────────────────────────────────────────────── */

function HelplineSection() {
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
      toast.success("Helpline numbers updated — they'll appear on new reports & invoices.");
      queryClient.invalidateQueries({ queryKey: ["staff", "ships"] });
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl flex items-center gap-2">
          <Phone className="size-5 text-gold" /> Helpline numbers
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Printed in the top corner of every guide report and customer invoice. Separate
          multiple numbers with commas.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading…
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
        dirty ? "border-gold/50 shadow-gold" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <ShipIcon className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight truncate">{ship.name}</div>
          <div className="text-[10px] text-muted-foreground">Document helpline numbers</div>
        </div>
        {dirty && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
            Unsaved
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            Phone numbers (comma-separated)
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
          <span className="text-muted-foreground">On the PDF: </span>
          {preview.length > 0 ? (
            <span className="font-medium">Helpline: {preview.join("  ·  ")}</span>
          ) : (
            <span className="italic text-muted-foreground">no helpline line shown</span>
          )}
        </div>

        <button
          disabled={!dirty || saving}
          onClick={() => onSave(value)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {dirty ? "Save changes" : "Saved"}
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
