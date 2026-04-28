import React from 'react';
import { WorkoutDay } from '../types';
import { Card } from '../components/Card';
import { Check, Dumbbell, ListChecks } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { getVideoUrl } from '../services/aiService';

interface WorkoutViewProps {
  plan: WorkoutDay[];
  onToggleExercise: (dayIndex: number, exerciseId: string) => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ plan, onToggleExercise }) => {
  const activeDayIndex = 0;
  const dayPlan = plan[activeDayIndex];

  if (!dayPlan) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Dumbbell className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-xl font-black text-slate-950">No workout selected</h2>
        <p className="mt-2 text-sm text-slate-600">Open the dashboard and choose a muscle group to generate today's training session.</p>
      </Card>
    );
  }

  const completed = dayPlan.exercises.filter((exercise) => exercise.completed).length;
  const total = dayPlan.exercises.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Workout session</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{dayPlan.day}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Watch the full movement, complete each exercise, and keep the session moving with controlled form.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Complete</p>
            <p className="text-2xl font-black text-slate-950">{progress}%</p>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {dayPlan.exercises.map((exercise) => (
          <Card
            key={exercise.id}
            className={`overflow-hidden p-0 ${exercise.completed ? 'border-emerald-300 bg-emerald-50/60' : ''}`}
          >
            <div className="relative bg-slate-100">
              <VideoPlayer url={getVideoUrl(exercise.name)} title={exercise.name} />
              <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                {exercise.muscleGroup}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onToggleExercise(activeDayIndex, exercise.id)}
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 transition-all ${
                    exercise.completed
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white text-slate-400 hover:border-teal-600 hover:text-teal-700'
                  }`}
                  aria-label={`Mark ${exercise.name} complete`}
                >
                  {exercise.completed ? <Check size={20} /> : <ListChecks size={20} />}
                </button>

                <div className="min-w-0 flex-1">
                  <h2 className={`text-lg font-black ${exercise.completed ? 'text-slate-500 line-through' : 'text-slate-950'}`}>
                    {exercise.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{exercise.equipment}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{exercise.sets} sets</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{exercise.reps} reps</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};
