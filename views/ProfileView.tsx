import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal, FitnessLevel } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
    User, Mail, Ruler, Weight, Zap, Target, Trophy,
    Edit3, Save, X, Activity, ChevronRight
} from 'lucide-react';

interface ProfileViewProps {
    user: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({ ...user });
    const [saving, setSaving] = useState(false);

    const handleChange = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdateProfile(formData);
            setEditing(false);
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ ...user });
        setEditing(false);
    };

    // Info row component
    const InfoRow = ({ icon: Icon, label, value, color = 'text-primary' }: {
        icon: any; label: string; value: string; color?: string;
    }) => (
        <div className="flex items-center gap-4 py-3 border-b border-slate-800/50 last:border-0">
            <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</p>
                <p className="text-white font-semibold truncate">{value}</p>
            </div>
            {!editing && <ChevronRight size={16} className="text-slate-700 flex-shrink-0" />}
        </div>
    );

    // Select component for edit mode
    const EditSelect = ({ label, value, options, onChange }: {
        label: string; value: string; options: string[]; onChange: (v: string) => void;
    }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
            >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        My Profile
                    </h1>
                    <p className="text-slate-400 mt-1">View and manage your personal info</p>
                </div>
                {!editing && (
                    <Button variant="outline" onClick={() => setEditing(true)} className="flex items-center gap-2">
                        <Edit3 size={16} />
                        Edit
                    </Button>
                )}
            </div>

            {/* Avatar / Name Hero */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
                <div className="relative flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl font-bold text-white">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        {editing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-xl py-2 px-4 text-white text-xl font-bold focus:ring-2 focus:ring-primary focus:outline-none w-full"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-white truncate">{user.name}</h2>
                        )}
                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                            <Mail size={14} />
                            {user.email || 'No email set'}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Details */}
            {editing ? (
                /* ─── Edit Mode ─── */
                <Card className="space-y-5 border-primary/30 bg-gradient-to-br from-slate-900 to-slate-950">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Edit3 size={18} className="text-primary" />
                        Edit Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => handleChange('age', Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <EditSelect
                            label="Gender"
                            value={formData.gender}
                            options={Object.values(Gender)}
                            onChange={(v) => handleChange('gender', v)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Height (cm)</label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => handleChange('height', Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Weight (kg)</label>
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => handleChange('weight', Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <EditSelect
                        label="Activity Level"
                        value={formData.activityLevel}
                        options={Object.values(ActivityLevel)}
                        onChange={(v) => handleChange('activityLevel', v as ActivityLevel)}
                    />

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Fitness Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(FitnessLevel).map(l => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => handleChange('fitnessLevel', l)}
                                    className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${formData.fitnessLevel === l
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Primary Goal</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(Goal).map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => handleChange('goal', g)}
                                    className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${formData.goal === g
                                        ? 'bg-secondary/20 border-secondary text-secondary'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button fullWidth onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Save size={18} />
                                    Save Changes
                                </span>
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="px-6">
                            <X size={18} />
                        </Button>
                    </div>
                </Card>
            ) : (
                /* ─── View Mode ─── */
                <>
                    <Card>
                        <h3 className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3">Body Stats</h3>
                        <InfoRow icon={User} label="Age" value={`${user.age} years`} color="text-violet-400" />
                        <InfoRow icon={User} label="Gender" value={user.gender} color="text-pink-400" />
                        <InfoRow icon={Ruler} label="Height" value={`${user.height} cm`} color="text-cyan-400" />
                        <InfoRow icon={Weight} label="Weight" value={`${user.weight} kg`} color="text-amber-400" />
                    </Card>

                    <Card>
                        <h3 className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3">Fitness Profile</h3>
                        <InfoRow icon={Activity} label="Activity Level" value={user.activityLevel} color="text-green-400" />
                        <InfoRow icon={Zap} label="Fitness Level" value={user.fitnessLevel} color="text-yellow-400" />
                        <InfoRow icon={Target} label="Goal" value={user.goal} color="text-red-400" />
                    </Card>

                    {/* Quick Stats Badges */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-violet-900/40 to-slate-900 border border-violet-800/30 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{user.weight}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">kg</p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-800/30 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{user.height}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">cm</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-800/30 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">
                                {(user.weight / ((user.height / 100) ** 2)).toFixed(1)}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">BMI</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
