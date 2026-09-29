import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  UserRound,
  UserRoundX,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createStaffAccount,
  deactivateStaffAccount,
  getCapabilityCatalogue,
  getStaffAccounts,
  updateStaffAccount,
  type CapabilityInfo,
  type StaffAccount,
  type StaffAccountWrite,
} from "@/lib/api/staffUsers";
import { getStaffUser, type StaffRole } from "@/lib/staffAuth";
import { PageHeader, StaffField, errorText, staffInputClass } from "@/components/staff/ui";

export const Route = createFileRoute("/staff/users")({
  component: StaffUsers,
  head: () => ({ meta: [{ title: "Staff — Dashboard" }] }),
});

type FormState = {
  username: string;
  first_name: string;
  email: string;
  role: StaffRole;
  capabilities: string[];
  password: string;
};

function StaffUsers() {
  const queryClient = useQueryClient();
  const me = getStaffUser();

  const accountsQuery = useQuery({
    queryKey: ["staff", "users"],
    queryFn: getStaffAccounts,
  });
  // The boxes come from the server, which is the list the endpoints enforce.
  // A copy kept here would drift, and drift shows as a box that grants nothing.
  const catalogueQuery = useQuery({
    queryKey: ["staff", "capabilities"],
    queryFn: getCapabilityCatalogue,
    staleTime: Infinity,
  });

  const catalogue = catalogueQuery.data?.capabilities ?? [];
  const defaults = catalogueQuery.data?.defaults ?? [];
  const labelFor = useMemo(
    () => Object.fromEntries(catalogue.map((c) => [c.key, c.label])),
    [catalogue],
  );

  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>({
    username: "",
    first_name: "",
    email: "",
    role: "booking",
    capabilities: [],
    password: "",
  });

  const isOpen = creating || editing !== null;
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["staff", "users"] });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: StaffAccountWrite = {
        username: form.username,
        first_name: form.first_name,
        email: form.email,
        role: form.role,
        // Administrators hold everything through the role, so their list is
        // not sent — storing one would suggest their access came from it.
        ...(form.role === "booking" ? { capabilities: form.capabilities } : {}),
      };
      // Sent only when filled: on an edit an empty box means "leave the
      // password alone", not "blank it".
      if (form.password) payload.password = form.password;

      return editing
        ? updateStaffAccount(editing.id, payload)
        : createStaffAccount(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Account updated" : "Account created");
      closeForm();
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const activationMutation = useMutation({
    // Returns void either way: the two calls have different shapes and the
    // caller only cares that it finished.
    mutationFn: async (account: StaffAccount) => {
      if (account.is_active) {
        await deactivateStaffAccount(account.id);
      } else {
        await updateStaffAccount(account.id, { is_active: true });
      }
    },
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  function openCreate() {
    setEditing(null);
    setForm({
      username: "",
      first_name: "",
      email: "",
      role: "booking",
      // The desk job is ticked to start with. An account that signs in to a
      // dashboard refusing everything reads as broken, not as restricted.
      capabilities: [...defaults],
      password: "",
    });
    setCreating(true);
  }

  function openEdit(account: StaffAccount) {
    setCreating(false);
    setEditing(account);
    setForm({
      username: account.username,
      first_name: account.first_name,
      email: account.email,
      role: account.role,
      capabilities: account.capabilities ?? [],
      password: "",
    });
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleCapability = (key: string) =>
    setForm((f) => ({
      ...f,
      capabilities: f.capabilities.includes(key)
        ? f.capabilities.filter((k) => k !== key)
        : [...f.capabilities, key],
    }));

  const accounts = accountsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        subtitle="Who can open this dashboard, and exactly what each of them can do."
      >
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-midnight shadow-luxe transition hover:brightness-105"
        >
          <Plus className="size-4" />
          New account
        </button>
      </PageHeader>

      {accountsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              labelFor={labelFor}
              isMe={account.username === me?.username}
              onEdit={() => openEdit(account)}
              onToggleActive={() => activationMutation.mutate(account)}
            />
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? `Edit ${editing.username}` : "New staff account"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="space-y-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <StaffField label="Username (used to log in)">
                  <input
                    className={staffInputClass}
                    value={form.username}
                    required
                    autoComplete="off"
                    onChange={(e) => set("username", e.target.value)}
                  />
                </StaffField>
                <StaffField label="Name">
                  <input
                    className={staffInputClass}
                    value={form.first_name}
                    onChange={(e) => set("first_name", e.target.value)}
                  />
                </StaffField>
              </div>

              <StaffField label="Email (optional)">
                <input
                  type="email"
                  className={staffInputClass}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </StaffField>

              {/* ── Access ─────────────────────────────────────────────── */}
              <StaffField label="Access">
                <div className="grid gap-2 sm:grid-cols-2">
                  <RoleOption
                    selected={form.role === "booking"}
                    onSelect={() => set("role", "booking")}
                    icon={UserRound}
                    title="Chosen permissions"
                    body="Only what you tick below."
                  />
                  <RoleOption
                    selected={form.role === "admin"}
                    onSelect={() => set("role", "admin")}
                    icon={ShieldCheck}
                    title="Administrator"
                    body="Everything, including managing these accounts."
                  />
                </div>
              </StaffField>

              {form.role === "booking" ? (
                <CapabilityPicker
                  catalogue={catalogue}
                  loading={catalogueQuery.isLoading}
                  selected={form.capabilities}
                  onToggle={toggleCapability}
                  onPreset={(keys) => set("capabilities", keys)}
                  defaults={defaults}
                />
              ) : (
                <div className="flex gap-3 rounded-xl border border-gold/40 bg-gold/5 p-4 text-sm">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
                  <p className="text-muted-foreground">
                    An administrator can do everything on the dashboard —
                    refunds, prices, the public site — and can create, change
                    and deactivate other accounts, including making more
                    administrators. Give this to somebody you would trust
                    with the business.
                  </p>
                </div>
              )}

              <StaffField
                label={editing ? "New password (leave blank to keep it)" : "Password"}
              >
                <input
                  type="password"
                  className={staffInputClass}
                  value={form.password}
                  required={!editing}
                  autoComplete="new-password"
                  onChange={(e) => set("password", e.target.value)}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Passwords are never shown again after this. If one is
                  forgotten, set a new one here.
                </p>
              </StaffField>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                {form.role === "booking" && form.capabilities.length === 0 && (
                  <p className="mr-auto text-xs text-destructive">
                    Nothing ticked — this account will be able to sign in and do nothing.
                  </p>
                )}
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
                  {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {editing ? "Save changes" : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleOption({
  selected,
  onSelect,
  icon: Icon,
  title,
  body,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
        selected ? "border-gold bg-gold/5 ring-1 ring-gold/40" : "border-border hover:bg-muted/50"
      }`}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${selected ? "text-gold" : "text-muted-foreground"}`} />
      <span className="text-sm">
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{body}</span>
      </span>
    </button>
  );
}

/** The boxes, grouped the way an owner thinks about the business.
 *
 *  Sensitive ones — money leaving, prices changing, the public being spoken
 *  to — carry a marker and a line of warning when ticked. Not a block: an
 *  owner may well want a manager who can refund. But a mis-tick there costs
 *  money, so it should never be an unnoticed one. */
function CapabilityPicker({
  catalogue,
  loading,
  selected,
  onToggle,
  onPreset,
  defaults,
}: {
  catalogue: CapabilityInfo[];
  loading: boolean;
  selected: string[];
  onToggle: (key: string) => void;
  onPreset: (keys: string[]) => void;
  defaults: string[];
}) {
  const groups = useMemo(() => {
    const out: { name: string; items: CapabilityInfo[] }[] = [];
    for (const c of catalogue) {
      const g = out.find((x) => x.name === c.group);
      if (g) g.items.push(c);
      else out.push({ name: c.group, items: [c] });
    }
    return out;
  }, [catalogue]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sensitiveTicked = catalogue.filter((c) => c.sensitive && selected.includes(c.key));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What this account can do
        </span>
        {/* Shortcuts, because the common cases are few and ticking eight
            boxes to get one of them is how the ninth gets ticked by mistake. */}
        <div className="flex gap-1.5">
          <PresetButton onClick={() => onPreset([...defaults])}>Booking desk</PresetButton>
          <PresetButton onClick={() => onPreset(catalogue.map((c) => c.key))}>All</PresetButton>
          <PresetButton onClick={() => onPreset([])}>None</PresetButton>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.name}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gold">
            {group.name}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.items.map((c) => {
              const on = selected.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => onToggle(c.key)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    on ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-md border transition ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      {c.label}
                      {c.sensitive && (
                        <AlertTriangle
                          aria-label="Sensitive"
                          className="size-3.5 text-amber-600"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {c.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {sensitiveTicked.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3.5 text-xs">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {sensitiveTicked.map((c) => c.label).join(", ")}
            </span>{" "}
            {sensitiveTicked.length === 1 ? "moves" : "move"} money or speaks to
            the public in the company&rsquo;s name. That is fine for somebody
            you trust with it — just make sure it was meant.
          </p>
        </div>
      )}
    </div>
  );
}

function PresetButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function AccountRow({
  account,
  labelFor,
  isMe,
  onEdit,
  onToggleActive,
}: {
  account: StaffAccount;
  labelFor: Record<string, string>;
  isMe: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const admin = account.role === "admin";

  return (
    <div
      className={`flex flex-wrap items-start gap-4 rounded-xl border border-border bg-card p-4 ${
        account.is_active ? "" : "opacity-60"
      }`}
    >
      <div
        className={`grid size-10 shrink-0 place-items-center rounded-full ${
          admin ? "gradient-gold text-midnight" : "bg-muted text-muted-foreground"
        }`}
      >
        {admin ? <ShieldCheck className="size-5" /> : <UserRound className="size-5" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{account.first_name || account.username}</span>
          {isMe && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              you
            </span>
          )}
          {admin && (
            <span className="rounded-full gradient-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-midnight">
              Administrator
            </span>
          )}
          {!account.is_active && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
              Deactivated
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{account.username}</p>

        {/* What they can actually do, as chips — the question an owner asks
            of this screen is "who can refund?", and that should be answerable
            by looking rather than by opening every account. */}
        {!admin && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {account.capabilities.length ? (
              account.capabilities.map((key) => (
                <span
                  key={key}
                  className="rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground/70"
                >
                  {labelFor[key] ?? key}
                </span>
              ))
            ) : (
              <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                No permissions — can sign in but do nothing
              </span>
            )}
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          {account.last_login
            ? `Last signed in ${new Date(account.last_login).toLocaleDateString()}`
            : "Has never signed in"}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          title="Edit permissions or reset the password"
          aria-label="Edit"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
        {/* Deactivating is not deleting — the bookings this account created
            stay attributed to it. Hidden on your own row; the server refuses
            it anyway, and a button that cannot work is worse than none. */}
        {!isMe && (
          <button
            type="button"
            onClick={onToggleActive}
            title={
              account.is_active
                ? "Deactivate — ends access, keeps their history"
                : "Reactivate this account"
            }
            aria-label={account.is_active ? "Deactivate" : "Reactivate"}
            className={`grid size-9 place-items-center rounded-lg transition ${
              account.is_active
                ? "text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
                : "text-emerald-600 hover:bg-emerald-500/10"
            }`}
          >
            {account.is_active ? <UserRoundX className="size-4" /> : <KeyRound className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
