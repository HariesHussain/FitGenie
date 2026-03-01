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
    <div className="min-h-screen py-10 px-4 flex items-center justify-center">
      <Card className="max-w-lg w-full">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
          <p className="text-slate-400 text-sm">We need this to generate your AI plan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Age</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
              >
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Weight (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(FitnessLevel).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleChange('fitnessLevel', l)}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all ${formData.fitnessLevel === l
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
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
            <label className="text-xs font-medium text-slate-400">Primary Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Goal).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleChange('goal', g)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.goal === g
                    ? 'bg-secondary/20 border-secondary text-secondary'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
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