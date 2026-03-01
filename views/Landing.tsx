import React, { useState } from 'react';
import { Button } from '../components/Button';
import { StickyFooter } from '../components/StickyFooter';
import { Zap, Activity, Brain, ArrowRight } from 'lucide-react';

export const Landing = ({ onStart, onLogin, onSignup }: { onStart: () => void, onLogin: () => void, onSignup: () => void }) => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const features = [
    {
      id: 0,
      icon: Zap,
      color: 'text-yellow-400',
      title: 'Smart AI Plans',
      desc: 'Personalized workout routines generated instantly based on your goals and equipment.'
    },
    {
      id: 1,
      icon: Activity,
      color: 'text-secondary',
      title: 'Track Progress',
      desc: 'Visualize your journey with detailed analytics,  tracking, and weight history.'
    },
    {
      id: 2,
      icon: Brain,
      color: 'text-primary',
      title: 'Chat Coach',
      desc: '24/7 access to an AI fitness expert to answer your nutrition and training questions.'
    }
  ];

  const handleFeatureClick = (index: number) => {
    setActiveFeature(index === activeFeature ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full text-center space-y-8 transition-all duration-500 ease-in-out py-10">
        <div className="space-y-2">
          <div className="inline-block p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-4 shadow-xl">
             <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Brain className="text-white w-7 h-7" />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            FitGenie
          </h1>
          <p className="text-lg text-slate-400">
            Your personal AI fitness coach. Smart workouts & meal plans tailored just for you.
          </p>
        </div>

        <div className="grid gap-4">
          <Button variant="primary" fullWidth onClick={onStart} className="h-14 text-lg">
            Continue as Guest
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={onLogin}>Login</Button>
            <Button variant="outline" onClick={onSignup}>Sign Up</Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4 mt-8">
            <div className="grid grid-cols-3 gap-2">
                {features.map((feature, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleFeatureClick(idx)}
                        className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center ${
                            activeFeature === idx 
                            ? 'bg-slate-800 border-primary scale-105 shadow-lg shadow-primary/20' 
                            : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                    >
                        <feature.icon className={`w-6 h-6 mb-2 ${feature.color}`} />
                        <p className={`text-xs font-medium transition-colors ${
                            activeFeature === idx ? 'text-white' : 'text-slate-300'
                        }`}>
                            {feature.title}
                        </p>
                    </button>
                ))}
            </div>

            {/* Dynamic Feature Description */}
            <div className={`overflow-hidden transition-all duration-500 ${activeFeature !== null ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                {activeFeature !== null && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left animate-fade-in">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <span className={`${features[activeFeature].color}`}>●</span>
                                {features[activeFeature].title}
                            </h3>
                            <button onClick={onSignup} className="text-xs text-primary hover:text-white flex items-center gap-1 font-semibold">
                                Try it <ArrowRight size={12} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {features[activeFeature].desc}
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <StickyFooter />
    </div>
  );
};
