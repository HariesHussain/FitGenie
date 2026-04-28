import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../components/Card';
import { UserProfile, ExerciseLog } from '../types';
import { loadExerciseLogs, deleteExerciseLog } from '../services/api';
import { auth } from '../firebaseConfig';
import {
    Trash2, Dumbbell, Calendar, TrendingUp,
    Flame, Target, Clock, BarChart3, Award,
    ChevronDown, ChevronRight
} from 'lucide-react';

interface TrackerViewProps {
    user: UserProfile | null;
}

const BODY_PART_COLORS: Record<string, string> = {
    'Full Body': 'from-teal-500 to-cyan-600',
    'Chest': 'from-red-500 to-rose-600',
    'Back': 'from-blue-500 to-indigo-600',
    'Legs': 'from-green-500 to-emerald-600',
    'Shoulders': 'from-amber-500 to-orange-600',
    'Arms': 'from-cyan-500 to-teal-600',
    'Core': 'from-rose-500 to-red-600',
};

const BODY_PART_BG: Record<string, string> = {
    'Full Body': 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    'Chest': 'bg-red-500/20 border-red-500/30 text-red-400',
    'Back': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    'Legs': 'bg-green-500/20 border-green-500/30 text-green-400',
    'Shoulders': 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    'Arms': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    'Core': 'bg-pink-500/20 border-pink-500/30 text-pink-400',
};

export const TrackerView: React.FC<TrackerViewProps> = ({ user }) => {
    const [allLogs, setAllLogs] = useState<ExerciseLog[]>([]);
    const [loading, setLoading] = useState(true);
    const todayStrFull = new Date().toLocaleDateString('en-CA');
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({
        [todayStrFull]: true
    });

    const toggleDate = (date: string) => {
        setExpandedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };


    const uid = auth.currentUser?.uid || (user as any)?.uid || (user as any)?.id;

    // Load all logs
    const fetchAllLogs = useCallback(async () => {
        if (!uid) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await loadExerciseLogs(uid);
            setAllLogs(data);
        } catch (err) {
            console.error('Failed to load exercise logs:', err);
        } finally {
            setLoading(false);
        }
    }, [uid]);

    useEffect(() => {
        fetchAllLogs();
    }, [fetchAllLogs]);

    const handleDelete = async (logId: string) => {
        if (!uid) return;
        try {
            await deleteExerciseLog(uid, logId);
            setAllLogs(prev => prev.filter(l => l.id !== logId));
        } catch (err) {
            console.error('Failed to delete exercise log:', err);
        }
    };

    // ─── Computed Stats ───
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayLogs = allLogs.filter(l => l.date === todayStr);
    const totalSets = todayLogs.reduce((s, l) => s + l.sets, 0);

    // Simple estimate for calories burned from logged training volume.
    const estimateCalories = (log: ExerciseLog) => {
        const bodyWeight = Number(user?.weight || 70);
        const minutes = log.duration > 0
            ? log.duration
            : Math.max(4, Math.round((log.sets * (log.reps || 10)) / 20));
        const met = 6; // moderate/high resistance training
        const kcal = (met * 3.5 * bodyWeight / 200) * minutes;
        return Math.round(kcal);
    };
    const todayCaloriesBurned = todayLogs.reduce((sum, log) => sum + estimateCalories(log), 0);

    // Weekly data for chart
    const getLast7Days = () => {
        const days: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString('en-CA'));
        }
        return days;
    };

    const last7Days = getLast7Days();
    const weeklyData = last7Days.map(date => {
        const dayLogs = allLogs.filter(l => l.date === date);
        return { date, count: dayLogs.length };
    });
    const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);
    const weekLogs = allLogs.filter(l => last7Days.includes(l.date));

    // Streak calculation
    const getStreak = () => {
        const dates = [...new Set(allLogs.map(l => l.date))].sort().reverse();
        if (dates.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        const checkDate = new Date(today);

        // If no logs today, start checking from yesterday
        const tStr = today.toLocaleDateString('en-CA');
        if (!dates.includes(tStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toLocaleDateString('en-CA');
            if (dates.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    const streak = getStreak();

    // Body part heatmap (past 7 days)
    const bodyPartCounts: Record<string, number> = {};
    weekLogs.forEach(l => {
        bodyPartCounts[l.bodyPart] = (bodyPartCounts[l.bodyPart] || 0) + 1;
    });
    const allBodyParts = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
    const maxBodyPartCount = Math.max(...Object.values(bodyPartCounts), 1);

    // Intelligent Grouping: Month -> Day
    const groupedLogs = useMemo(() => {
        const groups: Record<string, Record<string, ExerciseLog[]>> = {};
        allLogs.forEach(log => {
            // Avoid timezone anomalies
            const d = new Date(log.date + 'T12:00:00');
            const monthYear = d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) groups[monthYear] = {};
            if (!groups[monthYear][log.date]) groups[monthYear][log.date] = [];
            groups[monthYear][log.date].push(log);
        });
        return groups;
    }, [allLogs]);

    const formatDayLabel = (dateStr: string) => {
        if (dateStr === todayStr) return "Today";
        const d = new Date(dateStr + 'T12:00:00');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateStr === yesterday.toLocaleDateString('en-CA')) return "Yesterday";
        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    if (!uid) {
        return (
            <div className="text-center text-slate-400 mt-10 space-y-4">
                <Dumbbell className="w-16 h-16 mx-auto text-slate-600" />
                <p className="text-lg font-medium text-white">Sign in to track your exercises</p>
                <p className="text-sm">Exercise tracking requires an account to save your progress.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        Exercise Tracker
                    </h1>
                    <p className="text-slate-400 mt-1">Auto-tracked from your workout sessions</p>
                </div>
            </div>

            {/* Streak + Today's Stats Row */}
            <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-amber-900/50 to-slate-900 border border-amber-700/30 rounded-xl p-4 text-center relative overflow-hidden">
                    <Award className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                    <p className="text-3xl font-black text-white">{streak}</p>
                    <p className="text-[10px] text-amber-400/80 uppercase font-bold tracking-wider">Day Streak</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center relative overflow-hidden">
                    <Dumbbell className="w-6 h-6 text-teal-400 mx-auto mb-1" />
                    <p className="text-3xl font-black text-white">{todayLogs.length}</p>
                    <p className="text-[10px] text-teal-400/80 uppercase font-bold tracking-wider">Today</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center relative overflow-hidden">
                    <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                    <p className="text-3xl font-black text-white">{todayCaloriesBurned}</p>
                    <p className="text-[10px] text-orange-400/80 uppercase font-bold tracking-wider">kcal Burned</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-900/50 to-slate-900 border border-cyan-700/30 rounded-xl p-4 text-center relative overflow-hidden">
                    <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-3xl font-black text-white">{totalSets}</p>
                    <p className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-wider">Sets</p>
                </div>
            </div>

            {/* Weekly Activity Chart */}
            <Card className="relative overflow-hidden">
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-primary" />
                            <h3 className="font-bold text-white">Weekly Activity</h3>
                        </div>
                        <span className="text-xs text-slate-500">{weekLogs.length} exercises this week</span>
                    </div>
                    <div className="flex items-end justify-between gap-2 h-28">
                        {weeklyData.map((day) => {
                            const height = day.count > 0 ? (day.count / maxWeeklyCount) * 100 : 4;
                            const isToday = day.date === todayStr;
                            const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'narrow' });
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                                    <span className={`text-[10px] font-bold transition-colors ${day.count > 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {day.count || ''}
                                    </span>
                                    <div
                                        className={`w-full rounded-lg transition-all duration-500 ${isToday
                                            ? 'bg-gradient-to-t from-primary to-primary/70 shadow-lg shadow-primary/20'
                                            : day.count > 0
                                                ? 'bg-gradient-to-t from-slate-600 to-slate-500'
                                                : 'bg-slate-800'
                                            }`}
                                        style={{ height: `${height}%`, minHeight: '4px' }}
                                    />
                                    <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-slate-500'}`}>
                                        {dayLabel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Body Part Heatmap */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-secondary" />
                    <h3 className="font-bold text-white">Muscle Group Focus</h3>
                    <span className="text-xs text-slate-500 ml-auto">Past 7 days</span>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {allBodyParts.map(bp => {
                        const count = bodyPartCounts[bp] || 0;
                        const intensity = count > 0 ? Math.max(0.2, count / maxBodyPartCount) : 0;
                        const bgClass = BODY_PART_BG[bp] || 'bg-slate-800 border-slate-700 text-slate-400';
                        return (
                            <div
                                key={bp}
                                className={`rounded-xl border p-3 text-center transition-all ${count > 0 ? bgClass : 'bg-slate-900/50 border-slate-800 text-slate-600'
                                    }`}
                                style={count > 0 ? { opacity: 0.4 + intensity * 0.6 } : {}}
                            >
                                <p className="text-lg font-black">{count}</p>
                                <p className="text-[9px] uppercase font-bold tracking-wider truncate">{bp}</p>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Exercise Logs Grouped */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : allLogs.length === 0 ? (
                <Card className="text-center py-10 border-dashed border-slate-700">
                    <Dumbbell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400 text-sm">No exercises logged yet</p>
                    <p className="text-slate-500 text-xs mt-1">Complete exercises in your workout to auto-track them!</p>
                </Card>
            ) : (
                <div className="space-y-8 mt-6">
                    {Object.entries(groupedLogs).map(([monthYear, daysObj]) => (
                        <div key={monthYear} className="space-y-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                                <Calendar size={20} className="text-primary" />
                                {monthYear}
                            </h2>
                            {Object.entries(daysObj).sort(([d1], [d2]) => d2.localeCompare(d1)).map(([date, dayLogs]) => {
                                const isExpanded = expandedDates[date];
                                return (
                                    <div key={date} className="space-y-2">
                                        <button
                                            onClick={() => toggleDate(date)}
                                            className="w-full flex items-center justify-between mt-4 mb-1 p-2 hover:bg-slate-800/50 rounded-lg transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronDown size={16} className="text-slate-400 group-hover:text-primary" /> : <ChevronRight size={16} className="text-slate-400 group-hover:text-primary" />}
                                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
                                                    {formatDayLabel(date)}
                                                </h3>
                                            </div>
                                            <span className="text-xs text-slate-500">{dayLogs.length} exercises</span>
                                        </button>

                                        {isExpanded && (
                                            <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-800/50 ml-2">
                                                {dayLogs.map(log => {
                                                    const gradientClass = BODY_PART_COLORS[log.bodyPart] || 'from-slate-500 to-slate-600';
                                                    return (
                                                        <Card key={log.id} className="relative overflow-hidden group hover:border-primary/30 transition-colors p-3">
                                                            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${gradientClass} rounded-l-xl`} />
                                                            <div className="flex items-center justify-between pl-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="font-bold text-white text-base">{log.exerciseName}</h4>
                                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${BODY_PART_BG[log.bodyPart] || 'bg-slate-800 border-slate-700 text-slate-400'
                                                                            }`}>
                                                                            {log.bodyPart}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                                                        <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-mono text-xs">
                                                                            {log.sets} × {log.reps}
                                                                        </span>
                                                                        {log.weight > 0 && (
                                                                            <span className="text-cyan-400 font-medium text-xs">{log.weight} kg</span>
                                                                        )}
                                                                        {log.duration > 0 && (
                                                                            <span className="flex items-center gap-1 text-xs">
                                                                                <Clock size={12} /> {log.duration}min
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {log.notes && (
                                                                        <p className="text-xs text-slate-500 mt-1 italic">"{log.notes}"</p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDelete(log.id)}
                                                                    className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Delete log"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
