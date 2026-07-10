import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Coffee,
  Copy,
  Eye,
  EyeOff,
  Info,
  Loader2,
  type LucideIcon,
  Moon,
  Pencil,
  Plus,
  Search,
  Soup,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import {
  DialogShell,
  PageHeader,
  StaffField,
  StatCard,
  errorText,
  staffInputClass,
} from "@/components/staff/ui";
import {
  createStaffFoodMenuItem,
  deleteStaffFoodMenuItem,
  getStaffFoodMenuItems,
  updateStaffFoodMenuItem,
} from "@/lib/api/staff";
import type {
  FoodMealType,
  FoodMenuDay,
  StaffFoodMenuItem,
  StaffFoodMenuItemWrite,
} from "@/lib/api/staffTypes";

export const Route = createFileRoute("/staff/food-menu")({
  component: FoodMenuPage,
});

const DAYS: { value: FoodMenuDay; label: string }[] = [
  { value: "day_1", label: "Day 1" },
  { value: "day_2", label: "Day 2" },
  { value: "day_3", label: "Day 3" },
];

type MealMeta = {
  value: FoodMealType;
  label: string;
  icon: LucideIcon;
  /** icon chip bg + text */
  chip: string;
  /** thin header underline tint */
  bar: string;
};

const MEAL_TYPES: MealMeta[] = [
  {
    value: "breakfast",
    label: "Breakfast",
    icon: Coffee,
    chip: "bg-amber-500/12 text-amber-600",
    bar: "bg-amber-500/60",
  },
  {
    value: "snacks",
    label: "Snacks",
    icon: UtensilsCrossed,
    chip: "bg-gold/15 text-gold",
    bar: "bg-gold/70",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: Soup,
    chip: "bg-emerald-500/12 text-emerald-600",
    bar: "bg-emerald-500/60",
  },
  {
    value: "dinner",
    label: "Dinner",
    icon: Moon,
    chip: "bg-ocean/10 text-ocean",
    bar: "bg-ocean/50",
  },
];

function FoodMenuPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "food-menu-items"],
    queryFn: getStaffFoodMenuItems,
  });
  const [adding, setAdding] = useState<{ day: FoodMenuDay; meal_type: FoodMealType } | null>(
    null,
  );
  const [editing, setEditing] = useState<StaffFoodMenuItem | null>(null);
  const [activeDay, setActiveDay] = useState<FoodMenuDay>("day_1");
  const [search, setSearch] = useState("");
  const [copyFrom, setCopyFrom] = useState<FoodMenuDay | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["staff", "food-menu-items"] });

  const toggleActive = useMutation({
    mutationFn: (item: StaffFoodMenuItem) =>
      updateStaffFoodMenuItem(item.id, { is_active: !item.is_active }),
    onSuccess: invalidate,
    onError: (err) => toast.error(errorText(err)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteStaffFoodMenuItem(id),
    onSuccess: () => {
      toast.success("Item removed.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const items = data ?? [];
  const shipId = items[0]?.ship;

  const stats = useMemo(() => {
    const active = items.filter((i) => i.is_active).length;
    return { total: items.length, active, hidden: items.length - active };
  }, [items]);

  const dayCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of DAYS) m[d.value] = items.filter((i) => i.day === d.value).length;
    return m;
  }, [items]);

  const q = search.trim().toLowerCase();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Food Menu"
        subtitle="Day-by-day dish pool the chef selects from — add, edit, or hide items per meal."
      >
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes…"
            className="w-56 bg-card border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-gold"
          />
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading food menu…
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total dishes" value={String(stats.total)} icon={UtensilsCrossed} />
            <StatCard
              label="Active"
              value={String(stats.active)}
              icon={UtensilsCrossed}
              tone="emerald"
            />
            <StatCard label="Hidden" value={String(stats.hidden)} icon={EyeOff} />
            <StatCard
              label="Per day (avg)"
              value={String(Math.round(stats.total / DAYS.length))}
              icon={Soup}
            />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-muted-foreground">
            <Info className="size-4 text-gold shrink-0 mt-0.5" />
            <p>
              This is the <strong className="text-foreground">selection pool</strong> for each
              day's menu — the chef picks the day's actual dishes from the active items below.
              Untick an item to hide it without deleting it.
            </p>
          </div>

          {/* Day tabs + copy */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setActiveDay(d.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    activeDay === d.value
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted-foreground hover:border-gold/50"
                  }`}
                >
                  {d.label}
                  <span className="ml-1.5 text-[10px] opacity-70">{dayCounts[d.value] ?? 0}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setCopyFrom(activeDay)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-medium text-ocean hover:border-gold hover:text-gold transition-colors"
            >
              <Copy className="size-3.5" /> Copy this day →
            </button>
          </div>

          {/* Meals grid for the active day */}
          <div className="grid md:grid-cols-2 gap-5">
            {MEAL_TYPES.map((meal) => {
              const mealItems = items
                .filter((i) => i.day === activeDay && i.meal_type === meal.value)
                .sort((a, b) => a.order - b.order);
              return (
                <MealCard
                  key={meal.value}
                  meal={meal}
                  items={mealItems}
                  query={q}
                  onAdd={() => setAdding({ day: activeDay, meal_type: meal.value })}
                  onEdit={setEditing}
                  onToggle={(i) => toggleActive.mutate(i)}
                  onDelete={(i) => {
                    if (confirm(`Remove "${i.name}"?`)) remove.mutate(i.id);
                  }}
                />
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-3">
              <UtensilsCrossed className="size-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No food menu items yet.</p>
            </div>
          )}
        </div>
      )}

      {adding && (
        <AddItemDialog
          day={adding.day}
          mealType={adding.meal_type}
          shipId={shipId}
          onClose={() => setAdding(null)}
          onCreated={invalidate}
        />
      )}

      {editing && (
        <EditItemDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={invalidate}
        />
      )}

      {copyFrom && shipId && (
        <CopyDayDialog
          fromDay={copyFrom}
          shipId={shipId}
          items={items}
          onClose={() => setCopyFrom(null)}
          onDone={invalidate}
        />
      )}
    </div>
  );
}

function MealCard({
  meal,
  items,
  query,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: {
  meal: MealMeta;
  items: StaffFoodMenuItem[];
  query: string;
  onAdd: () => void;
  onEdit: (i: StaffFoodMenuItem) => void;
  onToggle: (i: StaffFoodMenuItem) => void;
  onDelete: (i: StaffFoodMenuItem) => void;
}) {
  const Icon = meal.icon;
  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="group/card rounded-2xl border border-border bg-card overflow-hidden flex flex-col transition-all hover:shadow-luxe hover:border-border">
      {/* Header */}
      <div className="relative px-5 pt-4 pb-3.5 flex items-center justify-between">
        <span className="flex items-center gap-2.5">
          <span className={`size-8 rounded-lg grid place-items-center ${meal.chip}`}>
            <Icon className="size-4" />
          </span>
          <span className="font-display text-base leading-none">
            {meal.label}
            <span className="ml-2 text-[11px] text-muted-foreground font-sans align-middle">
              {activeCount}/{items.length} active
            </span>
          </span>
        </span>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-gold hover:bg-gold/10 transition-colors"
        >
          <Plus className="size-3.5" /> Add
        </button>
        {/* accent underline */}
        <span className={`absolute left-5 right-5 bottom-0 h-px ${meal.bar}`} />
      </div>

      {/* Body */}
      <div className="p-4 flex-1">
        {items.length === 0 ? (
          <button
            onClick={onAdd}
            className="w-full rounded-xl border border-dashed border-border py-6 text-xs text-muted-foreground hover:border-gold/50 hover:text-gold transition-colors"
          >
            + Add the first dish
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <DishChip
                key={item.id}
                item={item}
                dim={!!query && !item.name.toLowerCase().includes(query)}
                onEdit={() => onEdit(item)}
                onToggle={() => onToggle(item)}
                onDelete={() => onDelete(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** A single dish. Resting state is calm (name + status dot); edit/hide/delete
 * controls reveal on hover or keyboard focus. */
function DishChip({
  item,
  dim,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: StaffFoodMenuItem;
  dim: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const active = item.is_active;
  return (
    <div
      className={`group/chip relative flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-2 text-xs transition-all ${
        active
          ? "border-border bg-background hover:border-gold/50"
          : "border-border/60 bg-muted/40 text-muted-foreground line-through decoration-muted-foreground/40"
      } ${dim ? "opacity-20" : ""}`}
    >
      {/* status dot */}
      <span
        className={`size-1.5 rounded-full shrink-0 ${
          active ? "bg-emerald-500" : "bg-muted-foreground/40"
        }`}
      />
      <button
        onClick={onEdit}
        className="font-medium no-underline hover:text-gold whitespace-nowrap"
        title="Edit dish"
      >
        {item.name}
      </button>

      {/* Hover controls */}
      <span className="flex items-center gap-0.5 opacity-0 group-hover/chip:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          title={active ? "Hide from menu" : "Show on menu"}
          onClick={onToggle}
          className="size-5 rounded-full grid place-items-center text-muted-foreground hover:text-ocean hover:bg-ocean/10"
        >
          {active ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
        </button>
        <button
          title="Edit"
          onClick={onEdit}
          className="size-5 rounded-full grid place-items-center text-muted-foreground hover:text-gold hover:bg-gold/10"
        >
          <Pencil className="size-3" />
        </button>
        <button
          title="Delete"
          onClick={onDelete}
          className="size-5 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3" />
        </button>
      </span>
    </div>
  );
}

function CopyDayDialog({
  fromDay,
  shipId,
  items,
  onClose,
  onDone,
}: {
  fromDay: FoodMenuDay;
  shipId: number;
  items: StaffFoodMenuItem[];
  onClose: () => void;
  onDone: () => void;
}) {
  const targets = DAYS.filter((d) => d.value !== fromDay);
  const [toDay, setToDay] = useState<FoodMenuDay>(targets[0].value);
  const source = items.filter((i) => i.day === fromDay);
  const fromLabel = DAYS.find((d) => d.value === fromDay)?.label ?? fromDay;

  const mutation = useMutation({
    mutationFn: async () => {
      for (const it of source) {
        await createStaffFoodMenuItem({
          ship: shipId,
          day: toDay,
          meal_type: it.meal_type,
          name: it.name,
          order: it.order,
          is_active: it.is_active,
        });
      }
    },
    onSuccess: () => {
      toast.success(`Copied ${source.length} item(s).`);
      onDone();
      onClose();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell title={`Copy ${fromLabel}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Duplicate all <strong className="text-foreground">{source.length}</strong> dish(es) from{" "}
          {fromLabel} into another day. Existing items on the target day are kept.
        </p>
        <StaffField label="Copy into">
          <select
            value={toDay}
            onChange={(e) => setToDay(e.target.value as FoodMenuDay)}
            className={staffInputClass}
          >
            {targets.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </StaffField>
        <button
          disabled={source.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-30 disabled:shadow-none"
        >
          {mutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Copy className="size-3.5" />
          )}
          Copy {source.length} item(s)
        </button>
      </div>
    </DialogShell>
  );
}

function AddItemDialog({
  day,
  mealType,
  shipId,
  onClose,
  onCreated,
}: {
  day: FoodMenuDay;
  mealType: FoodMealType;
  shipId: number | undefined;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: StaffFoodMenuItemWrite) => createStaffFoodMenuItem(payload),
    onSuccess: () => {
      toast.success("Item added.");
      onCreated();
      onClose();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell title={`Add item — ${day.replace("_", " ")} / ${mealType}`} onClose={onClose}>
      <div className="space-y-4">
        <StaffField label="Item name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mixed Vegetables"
            className={staffInputClass}
            autoFocus
          />
        </StaffField>
        <button
          disabled={!name.trim() || !shipId || mutation.isPending}
          onClick={() =>
            shipId &&
            mutation.mutate({ ship: shipId, day, meal_type: mealType, name: name.trim() })
          }
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-30 disabled:shadow-none"
        >
          {mutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Add item
        </button>
      </div>
    </DialogShell>
  );
}

function EditItemDialog({
  item,
  onClose,
  onSaved,
}: {
  item: StaffFoodMenuItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item.name);

  const mutation = useMutation({
    mutationFn: (payload: Partial<StaffFoodMenuItemWrite>) =>
      updateStaffFoodMenuItem(item.id, payload),
    onSuccess: () => {
      toast.success("Item updated.");
      onSaved();
      onClose();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell title="Edit item" onClose={onClose}>
      <div className="space-y-4">
        <StaffField label="Item name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={staffInputClass}
            autoFocus
          />
        </StaffField>
        <button
          disabled={!name.trim() || name === item.name || mutation.isPending}
          onClick={() => mutation.mutate({ name: name.trim() })}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-30 disabled:shadow-none"
        >
          {mutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Save changes
        </button>
      </div>
    </DialogShell>
  );
}
