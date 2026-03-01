import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { confirmReset } from '../services/api';

interface UpdatePasswordProps {
    oobCode: string;
    onDone: () => void;
}

export const UpdatePassword: React.FC<UpdatePasswordProps> = ({ oobCode, onDone }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await confirmReset(oobCode, password);
            setSuccess(true);
        } catch (err: any) {
            if (err?.code === 'auth/invalid-action-code') {
                setError('This reset link has expired or already been used. Please request a new one.');
            } else if (err?.code === 'auth/weak-password') {
                setError('Password is too weak. Please use at least 6 characters.');
            } else {
                setError(err?.message || 'Failed to update password.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto redirect after success
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => onDone(), 3000);
            return () => clearTimeout(timer);
        }
    }, [success, onDone]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[100px]"></div>
            </div>

            <Card className="max-w-md w-full relative z-10 animate-fade-in">
                {success ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="text-green-400 w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Password Updated!</h2>
                        <p className="text-slate-400 text-sm">Your password has been reset successfully. Redirecting to login...</p>
                        <div className="w-8 h-8 mx-auto">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="text-primary w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Set New Password</h2>
                            <p className="text-slate-400 text-sm mt-1">Enter your new password below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center flex items-center justify-center gap-2">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" fullWidth className="mt-4" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Updating...
                                    </span>
                                ) : 'Update Password'}
                            </Button>
                        </form>
                    </>
                )}
            </Card>
        </div>
    );
};
