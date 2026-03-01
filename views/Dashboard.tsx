import React from 'react';
import { UserProfile, WorkoutDay, MealPlan, FitnessLevel, BodyPart } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckCircle, Trophy, ArrowRight, Dumbbell, RefreshCcw } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { StickyFooter } from '../components/StickyFooter';

interface DashboardProps {
  user?: UserProfile | null;
  todaysWorkout: WorkoutDay | undefined;
  mealPlan: MealPlan;
  onNavigate: (view: string) => void;
  onUpdateWorkout: (target: BodyPart, level: FitnessLevel) => void;
  onResetWorkout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, todaysWorkout, mealPlan, onNavigate, onUpdateWorkout, onResetWorkout }) => {
  // Use the fitness level from user profile (set during onboarding)
  const userLevel = (user?.fitnessLevel as FitnessLevel) ?? FitnessLevel.BEGINNER;

  const hasActiveWorkout = !!todaysWorkout;

  const completedCount = todaysWorkout?.exercises?.filter(e => e.completed).length || 0;
  const totalCount = todaysWorkout?.exercises?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleGenerate = (target: BodyPart) => {
    onUpdateWorkout(target, userLevel);
  };

  // Pie chart data
  const data = mealPlan ? [
    { name: 'Protein', value: mealPlan.breakfast.protein * 4, color: '#7c3aed' },
    { name: 'Carbs', value: mealPlan.breakfast.carbs * 4, color: '#22d3ee' },
    { name: 'Fat', value: mealPlan.breakfast.fats * 4, color: '#f59e0b' },
  ] : [];

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Hello, {user?.name ? user.name.split(' ')[0] : 'Guest'} 👋
          </h1>
          <p className="text-slate-400">Let's crush your {user?.goal ? user.goal.toLowerCase() : 'fitness'} goals today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">{userLevel}</span>
        </div>
      </div>

      {/* --- WORKOUT SELECTION LOGIC --- */}
      {!hasActiveWorkout ? (
        <div className="animate-fade-in space-y-4">
          <Card className="border-primary bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">What are we training today?</h2>
              <p className="text-slate-400">Select a muscle group to generate your personalized session.</p>
              <p className="text-xs text-slate-500 mt-1">Level: <span className="text-primary font-bold">{userLevel}</span></p>
            </div>

            {/* Muscle Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(BodyPart).map((part) => (
                <button
                  key={part}
                  onClick={() => handleGenerate(part)}
                  className="group relative p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-primary hover:border-primary transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-6 h-6 text-slate-300 group-hover:text-primary" />
                  </div>
                  <span className="font-bold text-white">{part}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        /* --- ACTIVE WORKOUT VIEW --- */
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-primary/20 transition-colors"></div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Today's Focus: {todaysWorkout.day}</h3>
              </div>
              <p className="text-slate-400 text-sm mt-1">Difficulty: {userLevel}</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg">
              <Trophy className="text-yellow-400 w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{completedCount}/{totalCount} exercises</span>
              <span className="text-primary font-medium">{Math.round(progress)}% Complete</span>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="secondary" fullWidth className="text-sm py-3 font-bold" onClick={() => onNavigate('workout')}>
                {progress > 0 ? 'Resume Workout' : 'Start Session'}
              </Button>
              <Button variant="outline" onClick={onResetWorkout} title="Change Muscle Group" className="px-4">
                <div className="flex items-center gap-2">
                  <RefreshCcw size={18} />
                  <span className="hidden md:inline">Change Muscle</span>
                </div>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Nutrition Card */}
      {mealPlan && (
        <Card className="relative overflow-hidden cursor-pointer hover:border-secondary/50 transition-colors" onClick={() => onNavigate('diet')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-xl"></div>

          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-white">Nutrition Target</h3>
              <p className="text-slate-400 text-sm">{mealPlan.totalCalories} kcal daily goal</p>
            </div>
            <div className="h-16 w-16">
              <PieChart width={64} height={64}>
                <Pie
                  data={data}
                  cx={32}
                  cy={32}
                  innerRadius={20}
                  outerRadius={30}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center p-2 rounded-lg bg-slate-950 border border-slate-900">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Protein</p>
              <p className="font-bold text-violet-400 text-sm">~{Math.round(mealPlan.totalCalories * 0.3 / 4)}g</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-950 border border-slate-900">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Carbs</p>
              <p className="font-bold text-cyan-400 text-sm">~{Math.round(mealPlan.totalCalories * 0.4 / 4)}g</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-950 border border-slate-900">
              <p className="text-[10px] uppercase text-slate-500 font-bold">Fats</p>
              <p className="font-bold text-amber-400 text-sm">~{Math.round(mealPlan.totalCalories * 0.3 / 9)}g</p>
            </div>
          </div>
        </Card>
      )}

      <StickyFooter />
    </div>
  );
};