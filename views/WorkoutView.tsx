import React, { useState } from 'react';
import { WorkoutDay } from '../types';
import { Card } from '../components/Card';
import { Check, PlayCircle, Info, ImageOff } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { getVideoUrl } from '../services/aiService';


interface WorkoutViewProps {
  plan: WorkoutDay[];
  onToggleExercise: (dayIndex: number, exerciseId: string) => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ plan, onToggleExercise }) => {
  // Logic allows for multiple plans, but currently we just edit today's plan (index 0)
  const activeDayIndex = 0;
  const dayPlan = plan[activeDayIndex];

  // State to track failed videos so we can show a fallback UI (kept for compatibility)
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  const handleVideoError = (id: string) => {
    setVideoErrors(prev => ({ ...prev, [id]: true }));
  };

  if (!dayPlan) {
    return <div className="text-center text-slate-400 mt-10">No workout selected. Please go back to Dashboard.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{dayPlan.day}</h2>
        <p className="text-slate-400">Focus on form and controlled movements.</p>
      </div>

      {dayPlan.exercises.map((exercise) => (
        <Card
          key={exercise.id}
          className={`transition-all duration-300 overflow-hidden p-0 ${exercise.completed ? 'opacity-50 border-green-900' : ''}`}
        >
          {/* Video / Visual Section (supports mp4 and YouTube + graceful fallback) */}
          <div className="relative w-full bg-black group">
            <VideoPlayer url={getVideoUrl(exercise.name)} title={exercise.name} />
          </div>

          {/* Overlay Badge */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
            <span className="text-xs font-bold text-white uppercase">{exercise.muscleGroup}</span>
          </div>

          {/* Controls Section */}
          <div className="p-4" onClick={() => onToggleExercise(activeDayIndex, exercise.id)}>
            <div className="flex items-center gap-4 cursor-pointer">
              {/* Checkbox */}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${exercise.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-slate-600 hover:border-primary bg-slate-900'
                }`}>
                {exercise.completed && <Check size={18} className="text-white" />}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className={`font-bold text-lg ${exercise.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {exercise.name}
                  </h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-mono">{exercise.sets} Sets</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-mono">{exercise.reps} Reps</span>
                </div>
              </div>
            </div>

            {exercise.completed && (
              <div className="mt-3 text-center text-green-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                Completed
              </div>
            )}
          </div>
        </Card>
      ))}

      <div className="pt-8 pb-4 text-center">
        <p className="text-slate-500 text-sm italic">Tap circle to mark as complete</p>
      </div>
    </div>
  );
};
