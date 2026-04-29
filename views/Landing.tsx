import React from 'react';
import { Button } from '../components/Button';
import { ArrowRight, Brain, Download, Dumbbell, LockKeyhole, ShieldCheck, TrendingUp, Utensils } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

type LandingProps = {
  onStart: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onDownloadApp?: () => void;
  downloadHint?: string;
};

export const Landing = ({ onStart, onLogin, onSignup, onDownloadApp, downloadHint }: LandingProps) => {
  const features = [
    { icon: Dumbbell, title: 'Adaptive workouts', desc: "Generate training by body part, level, and today's progress." },
    { icon: Utensils, title: 'Nutrition targets', desc: 'Daily macro targets with meal cards that are easy to scan.' },
    { icon: TrendingUp, title: 'Progress history', desc: 'Track exercise logs, weekly activity, and long-term consistency.' },
  ];

  const isNative = Capacitor.isNativePlatform();

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
        <div className="flex items-center gap-2">
          {!isNative && (
            <button
              onClick={onDownloadApp}
              className="inline-flex items-center gap-1 rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 shadow-sm hover:bg-teal-100 sm:hidden"
              aria-label="Download App"
            >
              <Download className="h-3.5 w-3.5" />
              Download App
            </button>
          )}
          <button onClick={onLogin} className="whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            Login
          </button>
        </div>
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
            {!isNative && (
              <Button variant="outline" onClick={onDownloadApp} className="h-12 px-6 hidden sm:inline-flex lg:hidden">
                <Download className="h-4 w-4" /> Download App
              </Button>
            )}
          </div>
          {downloadHint && (
            <p className="mt-3 text-sm font-semibold text-slate-600 lg:hidden">{downloadHint}</p>
          )}

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
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Built for secure coaching</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">One account. Same plan on web and mobile.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Sign in once and continue from any device. Your profile, workout history, nutrition plans, and coach context stay synchronized.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Account security', 'Firebase Auth with protected user-level access controls.'],
                ['Data protection', 'Private records are stored with owner-scoped Firestore rules.'],
                ['Cross-device sync', 'Workout and nutrition data persist across web and installed app.'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <LockKeyhole className="h-5 w-5 text-emerald-700" />
              <p className="text-sm font-semibold leading-6 text-emerald-900">
                Your data is encrypted in transit and protected by authenticated access. We never sell personal information.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
