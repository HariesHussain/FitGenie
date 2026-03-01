import React from 'react';
import { MealPlan, Meal } from '../types';
import { Card } from '../components/Card';
import { RefreshCw, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
      {/* Date Navigation */}
      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
         <button onClick={onPrevDay} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft size={20} />
         </button>
         <div className="flex items-center gap-2 text-white font-semibold">
            <Calendar size={18} className="text-primary" />
            <span>{dateLabel}</span>
         </div>
         <button onClick={onNextDay} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight size={20} />
         </button>
      </div>

      <div className="flex justify-between items-center px-1">
        <div>
           <h2 className="text-2xl font-bold text-white">Daily Meal Plan</h2>
           <p className="text-slate-400">Total: ~{mealPlan.totalCalories} kcal</p>
        </div>
        <Button variant="ghost" onClick={onRegenerate} title="Regenerate/Shuffle Meals">
           <RefreshCw size={20} />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {meals.map((meal) => (
          <Card key={meal.label} className="p-0 overflow-hidden group">
            <div className="h-32 w-full overflow-hidden relative">
              <img 
                src={meal.data.image} 
                alt={meal.data.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              <span className="absolute bottom-2 left-4 text-white font-bold text-lg">{meal.label}</span>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                 <h4 className="font-medium text-primary">{meal.data.name}</h4>
                 <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded">
                    {meal.data.calories} kcal
                 </span>
              </div>
              
              <ul className="space-y-1 mb-3">
                 {meal.data.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-400 flex items-center gap-2">
                       <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                       {item}
                    </li>
                 ))}
              </ul>

              <div className="flex gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider border-t border-slate-800 pt-3">
                 <span>P: {meal.data.protein}g</span>
                 <span className="text-slate-700">|</span>
                 <span>C: {meal.data.carbs}g</span>
                 <span className="text-slate-700">|</span>
                 <span>F: {meal.data.fats}g</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};