import React from 'react';
import { MealPlan, Meal } from '../types';
import { Card } from '../components/Card';
import { RefreshCw, ChevronLeft, ChevronRight, Calendar, Utensils } from 'lucide-react';
import { Button } from '../components/Button';

interface DietViewProps {
  mealPlan: MealPlan;
  onNextDay: () => void;
  onPrevDay: () => void;
  onRegenerate: () => void;
  dateLabel: string;
}

export const DietView: React.FC<DietViewProps> = ({ mealPlan, onNextDay, onPrevDay, onRegenerate, dateLabel }) => {
  const meals: { label: string, data: Meal }[] = [
    { label: 'Breakfast', data: mealPlan.breakfast },
    { label: 'Lunch', data: mealPlan.lunch },
    { label: 'Dinner', data: mealPlan.dinner },
    { label: 'Snack', data: mealPlan.snack },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-amber-700">Nutrition planner</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Daily Meal Plan</h1>
            <p className="mt-2 text-sm text-slate-600">Daily Meals</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button onClick={onPrevDay} className="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-slate-950" aria-label="Previous day">
              <ChevronLeft size={20} />
            </button>
            <div className="flex min-w-28 items-center justify-center gap-2 px-3 text-sm font-black text-slate-800">
              <Calendar size={17} className="text-amber-700" />
              {dateLabel}
            </div>
            <button onClick={onNextDay} className="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-slate-950" aria-label="Next day">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onRegenerate}>
          <RefreshCw size={18} />
          Regenerate Meals
        </Button>
      </div>

      <section className="grid gap-5 md:grid-cols-2">
        {meals.map((meal) => (
          <Card key={meal.label} className="overflow-hidden p-0">
            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
              <img
                src={meal.data.image}
                alt={meal.data.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">
                  <Utensils size={14} />
                  {meal.label}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black text-slate-950">{meal.data.name}</h2>
                {/* Removed kcal badge */}
              </div>

              <ul className="mt-4 grid gap-2">
                {meal.data.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-700" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4">
                <Macro label="Protein" value={`${meal.data.protein}g`} />
                <Macro label="Carbs" value={`${meal.data.carbs}g`} />
                <Macro label="Fats" value={`${meal.data.fats}g`} />
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

const Macro = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-slate-50 p-2 text-center">
    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
  </div>
);
