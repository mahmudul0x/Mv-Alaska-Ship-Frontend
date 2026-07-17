import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useFoodMenu } from "@/hooks/queries/useFoodMenu";

const MEAL_ORDER = ["breakfast", "snacks", "lunch", "dinner"] as const;
const MEAL_LABEL: Record<(typeof MEAL_ORDER)[number], string> = {
  breakfast: "Breakfast",
  snacks: "Snacks",
  lunch: "Lunch",
  dinner: "Dinner",
};

/** Staff-managed 3-day onboard menu, rendered as a printed menu card — gold
 *  double frame, centered dishes. Shared by the cruise-experience and dining
 *  pages; renders nothing when no menu exists. */
export function FoodMenuSection() {
  const { data, isLoading } = useFoodMenu();
  const [activeDay, setActiveDay] = useState(0);

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-gold" /> Loading the menu…
      </div>
    );
  }

  if (!data || data.days.length === 0) {
    return null;
  }

  const day = data.days[activeDay] ?? data.days[0];
  const mealsByType = new Map(day.meals.map((m) => [m.meal_type, m]));

  return (
    <div>
      {/* Day tabs */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {data.days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(i)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-colors border ${
              i === activeDay
                ? "bg-ocean text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.day_label}
          </button>
        ))}
      </div>

      {/* The menu card — double gold frame, like a printed card on the table */}
      <motion.div
        key={day.day}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-6xl"
      >
        <div className="rounded-lg border border-gold/40 bg-background p-1.5 shadow-luxe">
          <div className="rounded-md border border-gold/25 px-6 py-8 md:px-12 md:py-10">
            {/* Card header */}
            <div className="text-center">
              <div className="eyebrow text-gold text-[10px]">M.V. Alaska ◆ The Galley</div>
              <h3 className="mt-2 font-display text-3xl md:text-4xl font-light tracking-wide">
                {day.day_label}
              </h3>
              <div className="mt-3 flex items-center justify-center gap-3 text-gold">
                <span className="h-px w-16 bg-gold/40" />
                <span className="text-[10px] leading-none">◆</span>
                <span className="h-px w-16 bg-gold/40" />
              </div>
            </div>

            {/* Courses */}
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8">
              {MEAL_ORDER.map((mealType) => {
                const meal = mealsByType.get(mealType);
                return (
                  <div key={mealType} className="text-center">
                    <h4 className="eyebrow text-gold flex items-center justify-center gap-3">
                      <span className="h-px w-6 bg-gold/40" />
                      {MEAL_LABEL[mealType]}
                      <span className="h-px w-6 bg-gold/40" />
                    </h4>
                    {meal && meal.items.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {meal.items.map((item) => (
                          <li
                            key={item}
                            className="font-display text-lg text-foreground/85 leading-snug"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground/60">—</p>
                    )}
                  </div>
                );
              })}
            </div>

            {data.note && (
              <p className="mt-8 text-center text-xs text-muted-foreground italic">
                {data.note}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
