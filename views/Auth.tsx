import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react';
import { sendResetEmail, signupWithEmail, getFriendlyErrorMessage } from "../services/api";

interface AuthProps {
  initialMode: 'login' | 'signup';
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => void;
  onBack: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const Auth: React.FC<AuthProps> = ({ initialMode, onLogin, onSignup, onBack }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const title = mode === 'signup' ? 'Create Account' : mode === 'forgot-password' ? 'Reset Password' : 'Welcome Back';
  const subtitle = mode === 'signup'
    ? 'Create your secure FitGenie account.'
    : mode === 'forgot-password'
      ? 'Enter your email to receive a reset link.'
      : 'Login to continue your plan.';

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setPassword('');
  };

  const validateEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateEmail()) return;

    if (mode === 'forgot-password') {
      setLoading(true);
      try {
        await sendResetEmail(email.trim());
        setMessage('Password reset email sent. Check your inbox and spam folder.');
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err) || 'Failed to send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signupWithEmail(email.trim(), password);
        onSignup(name.trim(), email.trim(), password);
      } else {
        await onLogin(email.trim(), password);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-surface flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="relative z-10 w-full max-w-md">
        <button
          onClick={() => {
            if (mode === 'forgot-password') switchMode('login');
            else onBack();
          }}
          className="absolute left-4 top-4 rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="mb-8 mt-4 text-center">
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="input-shell w-full rounded-xl py-2.5 pl-10 pr-4 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="input-shell w-full rounded-xl py-2.5 pl-10 pr-4 placeholder:text-slate-400"
              />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide text-slate-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="input-shell w-full rounded-xl py-2.5 pl-10 pr-4 placeholder:text-slate-400"
                />
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="ml-auto block text-xs font-semibold text-primary hover:text-teal-300"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700">{error}</div>}
          {message && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center text-xs font-semibold text-green-700">{message}</div>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </Button>

          <p className="text-center text-xs text-slate-500">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="font-bold text-primary hover:text-teal-300"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};
