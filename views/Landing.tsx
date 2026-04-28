import React from 'react';
import { Button } from '../components/Button';
import { Activity, ArrowRight, Brain, CheckCircle2, Dumbbell, LockKeyhole, ShieldCheck, TrendingUp, Utensils } from 'lucide-react';

export const Landing = ({ onStart, onLogin, onSignup }: { onStart: () => void, onLogin: () => void, onSignup: () => void }) => {
  const features = [
    { icon: Dumbbell, title: 'Adaptive workouts', desc: "Generate training by body part, level, and today's progress." },
    { icon: Utensils, title: 'Nutrition targets', desc: 'Daily calorie and macro targets with meal cards that are easy to scan.' },
    { icon: TrendingUp, title: 'Progress history', desc: 'Track exercise logs, weekly activity, streaks, and consistency.' },
  ];

  return (
    <div className="app-surface min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-slate-950">FitGenie</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI Fitness Coach</p>
          </div>
        </div>
        <button onClick={onLogin} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          Login
        </button>
      </header>

      <main className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 lg:min-h-[calc(100vh-84px)] lg:grid-cols-[1.02fr_0.98fr] lg:pb-20">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-800">
            <ShieldCheck className="h-4 w-4" />
            Secure personal training workspace
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 text-balance sm:text-6xl lg:text-7xl">
            Train with a cleaner plan, not another noisy fitness app.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            FitGenie combines personalized workout generation, meal targets, AI coaching, and progress tracking in a fast React application built for real daily use.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" onClick={onSignup} className="h-12 px-6">
              Create Account <ArrowRight size={18} />
            </Button>
            <Button variant="outline" onClick={onStart} className="h-12 px-6">
              Try Guest Mode
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <feature.icon className="mb-3 h-5 w-5 text-teal-700" />
                <h2 className="text-sm font-black text-slate-950">{feature.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Today's program</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Chest Strength</h2>
              </div>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">Intermediate</span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ['Barbell Bench Press', '4 sets', '8-12 reps'],
                ['Incline Dumbbell Press', '4 sets', '10-12 reps'],
                ['Chest Dips', '3 sets', 'Failure'],
              ].map(([exercise, sets, reps], index) => (
                <div key={exercise} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{exercise}</p>
                    <p className="text-xs font-semibold text-slate-500">{sets} / {reps}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-slate-300" />
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['Calories', '2550'],
                ['Protein', '191g'],
                ['Streak', '7d'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <LockKeyhole className="h-5 w-5 text-emerald-700" />
              <p className="text-sm font-semibold leading-6 text-emerald-900">
                Your data is fully encrypted, secured, and always under your control. We never share or sell your information.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
