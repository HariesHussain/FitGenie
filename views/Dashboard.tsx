import React from 'react';
import { UserProfile, WorkoutDay, MealPlan, FitnessLevel, BodyPart } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Activity, ArrowRight, Dumbbell, Flame, RefreshCcw, ShieldCheck, Target, Trophy } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';
import { useSEO } from '../hooks/useSEO';

interface DashboardProps {
  user?: UserProfile | null;
  todaysWorkout: WorkoutDay | undefined;
  mealPlan: MealPlan;
  onNavigate: (view: string) => void;
  onUpdateWorkout: (target: BodyPart, level: FitnessLevel) => void;
  onResetWorkout: () => void;
}

const bodyPartHints: Record<string, string> = {
  'Full Body': 'Balanced strength',
  Chest: 'Pressing power',
  Back: 'Pull strength',
  Legs: 'Lower-body drive',
  Shoulders: 'Overhead control',
  Arms: 'Accessory focus',
  Core: 'Stability work',
};

export const Dashboard: React.FC<DashboardProps> = ({ user, todaysWorkout, mealPlan, onNavigate, onUpdateWorkout, onResetWorkout }) => {
  useSEO({
    title: 'Dashboard',
    description: 'View your AI-generated daily workout, track nutrition macros, and monitor your fitness journey.',
    keywords: 'AI fitness dashboard, workout planner, nutrition tracker, daily macros'
  });

  const userLevel = (user?.fitnessLevel as FitnessLevel) ?? FitnessLevel.BEGINNER;
  const completedCount = todaysWorkout?.exercises?.filter(e => e.completed).length || 0;
  const totalCount = todaysWorkout?.exercises?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const chartData = mealPlan ? [
    { name: 'Protein', value: mealPlan.totalCalories * 0.3, color: '#0ea5e9' }, // primary
    { name: 'Carbs', value: mealPlan.totalCalories * 0.4, color: '#f59e0b' },   // secondary
    { name: 'Fats', value: mealPlan.totalCalories * 0.3, color: '#64748b' },    // muted
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr] animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-[2rem] border border-slate-200 bg-surface p-6 shadow-soft transition-all duration-300 hover:shadow-float sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-textMain font-heading sm:text-4xl">
                {user?.name ? user.name.split(' ')[0] + ',' : 'Hello,'} let's train
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-textMuted sm:text-base">
                Your personal AI coach is ready to guide you through your fitness journey.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-primaryDark">Level</p>
              <p className="text-lg font-black text-slate-900">{userLevel}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-surfaceHighlight p-5 transition-transform hover:-translate-y-1">
              <Activity className="h-6 w-6 text-primary" />
              <p className="mt-3 text-3xl font-bold text-textMain">{Math.round(progress)}%</p>
              <p className="text-sm font-medium text-textMuted mt-1">Progress</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surfaceHighlight p-5 transition-transform hover:-translate-y-1">
              <Flame className="h-6 w-6 text-secondary" />
              <p className="mt-3 text-3xl font-bold text-textMain">{mealPlan?.totalCalories || 0}</p>
              <p className="text-sm font-medium text-textMuted mt-1">Calorie Target</p>
            </div>
          </div>
        </div>

        <Card className="bg-slate-900 border-none shadow-float flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Trophy className="h-6 w-6 text-secondary" />
            </div>
            <h2 className="mt-6 text-2xl font-bold font-heading">Today's Workout</h2>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-300">
              {todaysWorkout ? todaysWorkout.day : 'Select a muscle group to start.'}
            </p>
          </div>
          {todaysWorkout ? (
            <div className="mt-8 relative z-10">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm font-medium text-slate-300">
                <span>{completedCount}/{totalCount} done</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="primary" className="!bg-primary hover:!bg-primaryDark flex-1 justify-center shadow-soft" onClick={() => onNavigate('workout')}>
                  Open workout <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button variant="outline" className="!text-white !border-white/20 hover:!bg-white/10" onClick={onResetWorkout} aria-label="Change muscle group">
                  <RefreshCcw size={18} />
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </section>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Pick a Muscle</p>
              <h2 className="mt-2 text-2xl font-bold text-textMain font-heading">Choose your focus</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-slate-200 bg-surfaceHighlight px-4 py-1.5 text-xs font-bold tracking-wide text-textMuted">{userLevel}</span>
              {todaysWorkout && (
                <Button variant="outline" onClick={onResetWorkout} className="text-xs px-3" aria-label="Change muscle group">
                  Change
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 mb-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(BodyPart).map((part) => {
              const isSelected = todaysWorkout && todaysWorkout.day?.toLowerCase().includes(part.toLowerCase());
              return (
                <button
                  key={part}
                  onClick={() => onUpdateWorkout(part, userLevel)}
                  className={`group rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-float focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isSelected
                      ? 'border-primary bg-primary/10 focus:ring-primary'
                      : 'border-slate-200 bg-surface hover:border-primary focus:ring-primary'
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-bold text-textMain font-heading text-lg">{part}</h3>
                  <p className="mt-1 text-sm text-textMuted font-medium">{bodyPartHints[part] || 'Focused session'}</p>
                </button>
              );
            })}
          </div>
        </Card>

      {mealPlan && (
        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card onClick={() => onNavigate('diet')} className="hover:border-secondary transition-all">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-secondary dark:text-amber-400">Daily Nutrition</p>
                <h2 className="mt-2 text-2xl font-bold text-textMain dark:text-slate-100 font-heading">Macros</h2>
                <p className="mt-1 text-[15px] text-textMuted dark:text-slate-400">{mealPlan.totalCalories} kcal</p>
              </div>
              <PieChart width={90} height={90} className="drop-shadow-sm">
                <Pie data={chartData} cx={45} cy={45} innerRadius={28} outerRadius={42} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Macro label="Protein" value={`~${Math.round(mealPlan.totalCalories * 0.3 / 4)}g`} />
              <Macro label="Carbs" value={`~${Math.round(mealPlan.totalCalories * 0.4 / 4)}g`} />
              <Macro label="Fats" value={`~${Math.round(mealPlan.totalCalories * 0.3 / 9)}g`} />
            </div>
          </Card>
        </section>
      )}
    </div>
  );
};

const Macro = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-100 bg-surfaceHighlight p-3 text-center transition-colors hover:bg-slate-100">
    <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">{label}</p>
    <p className="mt-1.5 text-base font-bold text-textMain">{value}</p>
  </div>
);
