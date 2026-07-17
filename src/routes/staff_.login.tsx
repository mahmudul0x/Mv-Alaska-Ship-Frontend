import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Anchor, Loader2, Lock, User } from "lucide-react";

import { staffLogin } from "@/lib/api/staff";
import { isStaffLoggedIn, setStaffSession } from "@/lib/staffAuth";
import type { ApiError } from "@/lib/api/types";

export const Route = createFileRoute("/staff_/login")({
  component: StaffLoginPage,
  beforeLoad: () => {
    if (isStaffLoggedIn()) throw redirect({ to: "/staff" });
  },
  head: () => ({ meta: [{ title: "Staff Login — MV Alaska" }] }),
});

function StaffLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await staffLogin(username, password);
      setStaffSession(data.access, data.refresh, data.user);
      navigate({ to: "/staff" });
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.fieldErrors
          ? Object.values(apiError.fieldErrors).flat().join(" ")
          : apiError.detail || "Login failed. Check your credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-ocean via-ocean to-midnight flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="size-14 rounded-2xl gradient-gold grid place-items-center mx-auto mb-4 shadow-luxe">
            <Anchor className="size-7 text-ocean" />
          </div>
          <h1 className="font-display text-3xl text-background">MV Alaska</h1>
          <p className="eyebrow text-gold-soft text-[10px] mt-1">Staff Dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl shadow-luxe p-6 space-y-4"
        >
          <div>
            <label className="eyebrow text-muted-foreground text-[10px] block mb-2">Username</label>
            <div className="relative">
              <User className="size-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
          <div>
            <label className="eyebrow text-muted-foreground text-[10px] block mb-2">Password</label>
            <div className="relative">
              <Lock className="size-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-luxe disabled:opacity-50"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="text-center text-xs text-background/40 mt-6">
          Staff access only · MV Alaska Cruise Ship
        </p>
      </div>
    </div>
  );
}
