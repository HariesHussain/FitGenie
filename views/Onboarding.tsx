import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal, FitnessLevel } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Ruler, Weight, User, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialData?: Partial<UserProfile>;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: 'Guest User',
    age: 25,
    gender: Gender.MALE,
    height: 175,
    weight: 75,
    activityLevel: ActivityLevel.MODERATE,
    fitnessLevel: FitnessLevel.BEGINNER,
    goal: Goal.GAIN,
    isGuest: true,
    ...initialData
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData as UserProfile);
  };

  return (
    <div className="app-surface min-h-screen py-10 px-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Personalization</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Build your fitness profile</h2>
          <p className="mt-2 text-sm text-slate-600">These details generate safer workout intensity and nutrition targets.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">Age</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className="input-shell w-full rounded-xl py-2.5 pl-10 pr-4"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="input-shell w-full rounded-xl py-2.5 px-4 appearance-none"
              >
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', Number(e.target.value))}
                  className="input-shell w-full rounded-xl py-2.5 pl-10 pr-4"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">Weight (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', Number(e.target.value))}
                  className="input-shell w-full rounded-xl py-2.5 pl-10 pr-4"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(FitnessLevel).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleChange('fitnessLevel', l)}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all ${formData.fitnessLevel === l
                    ? 'bg-teal-50 border-teal-500 text-teal-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <div className="mb-1 flex justify-center">
                    {l === FitnessLevel.BEGINNER && <span className="w-2 h-2 rounded-full bg-green-400" />}
                    {l === FitnessLevel.INTERMEDIATE && <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /><span className="w-2 h-2 rounded-full bg-yellow-400" /></div>}
                    {l === FitnessLevel.ADVANCED && <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="w-2 h-2 rounded-full bg-red-500" /><span className="w-2 h-2 rounded-full bg-red-500" /></div>}
                  </div>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Primary Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Goal).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleChange('goal', g)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.goal === g
                    ? 'bg-amber-50 border-amber-500 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth className="mt-4">
            Generate My Plan
          </Button>
        </form>
      </Card>
    </div>
  );
};
