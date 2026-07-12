import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  CalendarRange,
  ClipboardList,
  Loader2,
  Percent,
  Receipt,
  Ship,
  TrendingUp,
  Undo2,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/components/staff/ui";
import { getStaffOverview } from "@/lib/api/staff";
import type { BookingStatus } from "@/lib/api/types";
import { formatBDT, parseMoney } from "@/lib/money";

export const Route = createFileRoute("/staff/")({
  component: OverviewPage,
});

/** Donut slice color per status — reads against the cream/emerald theme. */
const STATUS_HEX: Record<BookingStatus, string> = {
  pending: "#f59e0b",
  partially_paid: "#fbbf24",
  fully_paid: "#059669",
  completed: "#047857",
  cancelled: "#e11d48",
};

const TODAY_LABEL = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

function OverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "overview"],
    queryFn: getStaffOverview,
  });

  if (isLoading || !data) {
    return (
      <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-gold" /> Loading overview…
      </div>
    );
  }

  const totalBookings = Object.values(data.bookings_by_status).reduce((a, b) => a + b, 0);

  const stats = [
    {
      label: "Upcoming packages",
      value: String(data.upcoming_packages),
      icon: CalendarRange,
      hint: "Open & departing soon",
    },
    {
      label: "Active bookings",
      value: String(data.active_bookings),
      icon: ClipboardList,
      hint: (
        <>
          <span className="font-medium text-foreground">{data.bookings_today}</span> today ·{" "}
          <span className="font-medium text-foreground">{data.bookings_this_week}</span> this week
        </>
      ),
    },
    {
      label: "Total collected",
      value: formatBDT(data.total_collected),
      icon: Banknote,
      tone: "emerald" as const,
      hint: `of ${formatBDT(data.total_revenue_expected)} expected`,
    },
    {
      label: "Outstanding due",
      value: formatBDT(data.total_due),
      icon: Wallet,
      highlight: true,
      hint: "To collect on the ship",
    },
    {
      label: "Collection rate",
      value: `${data.collection_rate}%`,
      icon: Percent,
      hint: "Paid vs. expected",
    },
    {
      label: "Awaiting payment",
      value: String(data.pending_payment_bookings),
      icon: Receipt,
      hint: "Pending bookings",
    },
    {
      label: "Refunds owed",
      value: String(data.refunds_owed_count),
      icon: Undo2,
      tone: "destructive" as const,
      hint:
        data.refunds_owed_count > 0
          ? `${formatBDT(data.refunds_owed_paid_total)} to return — call the customers`
          : "No refunds pending",
    },
  ];

  const chartData = data.packages
    .slice()
    .reverse()
    .map((p) => ({
      name: p.title.length > 18 ? `${p.title.slice(0, 18)}…` : p.title,
      Collected: parseMoney(p.paid_total),
      Due: parseMoney(p.due_total),
    }));

  const donutData = STATUS_ORDER.map((status) => ({
    status,
    name: STATUS_LABEL[status],
    value: data.bookings_by_status[status] ?? 0,
  })).filter((d) => d.value > 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader title="Overview" subtitle="Live snapshot of bookings and collections.">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <CalendarRange className="size-3.5 text-gold" />
          {TODAY_LABEL}
        </div>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Collection chart */}
        <SectionCard
          title="Collection by package (BDT)"
          icon={TrendingUp}
          className="lg:col-span-2"
          bodyClassName="p-5"
        >
          {chartData.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No packages yet.</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }} barGap={6}>
                  <defs>
                    <linearGradient id="fillCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--mangrove)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--ocean)" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="fillDue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold-soft)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 6"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [`৳ ${value.toLocaleString()}`, ""]}
                    cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      boxShadow: "0 10px 30px -12px rgba(6,78,59,0.35)",
                      fontSize: 12,
                    }}
                    labelStyle={{ fontWeight: 600, color: "var(--foreground)" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={9}
                  />
                  <Bar
                    dataKey="Collected"
                    fill="url(#fillCollected)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                  <Bar
                    dataKey="Due"
                    fill="url(#fillDue)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        {/* Booking status donut */}
        <SectionCard title="Bookings by status" bodyClassName="p-5">
          {donutData.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No bookings yet.</div>
          ) : (
            <>
              <div className="h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {donutData.map((d) => (
                        <Cell key={d.status} fill={STATUS_HEX[d.status]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} booking(s)`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="font-display text-3xl leading-none">{totalBookings}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    Total
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {donutData.map((d) => (
                  <div key={d.status} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: STATUS_HEX[d.status] }}
                      />
                      {d.name}
                    </span>
                    <span className="text-muted-foreground">
                      {d.value}
                      <span className="ml-1 text-[10px]">
                        ({Math.round((d.value / totalBookings) * 100)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Per-ship breakdown */}
      {data.by_ship.length > 0 && (
        <SectionCard title="Fleet breakdown" icon={Ship}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0 divide-border">
            {data.by_ship.map((ship) => (
              <div key={ship.ship_id} className="p-5 sm:border-r sm:border-border last:border-r-0">
                <div className="font-medium text-sm mb-3">{ship.ship_name}</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <ShipStat label="Upcoming" value={String(ship.upcoming_packages)} />
                  <ShipStat label="Active bookings" value={String(ship.active_bookings)} />
                  <ShipStat label="Collected" value={formatBDT(ship.paid_total)} />
                  <ShipStat label="Due" value={formatBDT(ship.due_total)} tone="gold" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <SectionCard
          title="Recent bookings"
          action={
            <Link to="/staff/bookings" className="text-xs text-gold hover:underline">
              View all →
            </Link>
          }
        >
          <div className="divide-y divide-border">
            {data.recent_bookings.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No bookings yet.
              </div>
            ) : (
              data.recent_bookings.map((b) => (
                <div
                  key={b.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.customer_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {b.booking_code} · {b.package_title} · Room {b.room_number}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={b.status} />
                    <div className="text-right font-medium">{formatBDT(b.total_amount)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Recent payments */}
        <SectionCard title="Recent payments">
          <div className="divide-y divide-border">
            {data.recent_payments.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No payments yet.
              </div>
            ) : (
              data.recent_payments.map((p) => (
                <div
                  key={p.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.booking_code}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {p.gateway}{" "}
                      {p.paid_at ? `· ${new Date(p.paid_at).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <div className="font-medium text-emerald-700 shrink-0">
                    +{formatBDT(p.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Package quick list */}
      <SectionCard
        title="Recent packages"
        action={
          <Link to="/staff/packages" className="text-xs text-gold hover:underline">
            Manage packages →
          </Link>
        }
      >
        <div className="divide-y divide-border">
          {data.packages.map((p) => (
            <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium truncate">{p.title}</div>
                  {!p.is_bookable && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-muted text-muted-foreground shrink-0">
                      Not bookable
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{p.start_date}</div>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-right">
                <PkgStat label="Occupancy" value={`${p.occupancy_pct}%`} />
                <PkgStat label="Bookings" value={String(p.bookings_count)} />
                <PkgStat label="Collected" value={formatBDT(p.paid_total)} />
                <PkgStat label="Due" value={formatBDT(p.due_total)} tone="gold" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function ShipStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gold";
}) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className={`font-medium ${tone === "gold" ? "text-gold" : ""}`}>{value}</div>
    </div>
  );
}

function PkgStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gold";
}) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className={`font-medium ${tone === "gold" ? "text-gold" : ""}`}>{value}</div>
    </div>
  );
}
