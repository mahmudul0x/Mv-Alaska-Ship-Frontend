import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
  getStaffAccounts,
  updateStaffAccount,
  type StaffAccount,
  type StaffAccountWrite,
} from "@/lib/api/staffUsers";
import { getStaffUser, type StaffRole } from "@/lib/staffAuth";
import { PageHeader, StaffField, errorText, staffInputClass } from "@/components/staff/ui";

export const Route = createFileRoute("/staff/users")({
  component: StaffUsers,
  head: () => ({ meta: [{ title: "Staff — Dashboard" }] }),
});

/** What each role can actually reach, in the words staff would use.
 *
 *  Spelled out on the form rather than left to the role's name: "Booking
 *  staff" does not tell anybody whether that includes refunds, and getting it
 *  wrong means either somebody cannot do their job or somebody can issue
 *  money. Mirrors apps/accounts/permissions.py. */
const ROLES: { value: StaffRole; label: string; can: string; cannot: string }[] = [
  {
    value: "booking",
    label: "Booking staff",
    can: "Bookings, payments, invoices and customer messages. Can see sailings and cabins to book against them.",
    cannot: "Cannot change prices or sailings, issue refunds, publish offers, or manage staff.",
  },
  {
    value: "admin",
    label: "Administrator",
    can: "Everything, including refunds, pricing, the public site and these accounts.",
    cannot: "",
  },
];

type FormState = {
  username: string;
  first_name: string;
  email: string;
  role: StaffRole;
  password: string;
};

const BLANK: FormState = {
  username: "",
  first_name: "",
  email: "",
  role: "booking",
  password: "",
};

function StaffUsers() {
  const queryClient = useQueryClient();
  const me = getStaffUser();

  const accountsQuery = useQuery({
    queryKey: ["staff", "users"],
    queryFn: getStaffAccounts,
  });

  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);

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
    setForm(BLANK);
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
      password: "",
    });
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const accounts = accountsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        subtitle="Who can open this dashboard, and how much of it they can reach."
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
              isMe={account.username === me?.username}
              onEdit={() => openEdit(account)}
              onToggleActive={() => activationMutation.mutate(account)}
            />
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-card p-6 shadow-xl">
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
              className="space-y-5"
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

              <StaffField label="What this account can do">
                <div className="grid gap-2">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        form.role === role.value
                          ? "border-gold bg-gold/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === role.value}
                        onChange={() => set("role", role.value)}
                        className="mt-1 size-4 accent-primary"
                      />
                      <span className="text-sm">
                        <span className="font-semibold">{role.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {role.can}
                        </span>
                        {role.cannot && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {role.cannot}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </StaffField>

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

function AccountRow({
  account,
  isMe,
  onEdit,
  onToggleActive,
}: {
  account: StaffAccount;
  isMe: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const admin = account.role === "admin";

  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 ${
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
          <span className="font-semibold">
            {account.first_name || account.username}
          </span>
          {isMe && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              you
            </span>
          )}
          {!account.is_active && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
              Deactivated
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {account.username} · {account.role_display}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {account.last_login
            ? `Last signed in ${new Date(account.last_login).toLocaleDateString()}`
            : "Has never signed in"}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          title="Edit or reset the password"
          aria-label="Edit"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
        {/* Deactivating is not deleting. The account stays, with the bookings
            it created still attributed to it; only the access ends. Hidden for
            your own row — the server refuses it anyway, and offering a button
            that cannot work is worse than not offering it. */}
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
            {account.is_active ? (
              <UserRoundX className="size-4" />
            ) : (
              <KeyRound className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
