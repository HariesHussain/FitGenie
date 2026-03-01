import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Mail, Lock, User, ArrowLeft, ShieldCheck, Timer } from 'lucide-react';
import { sendOtpEmail } from "../services/emailService";
import { signupWithEmail, sendResetEmail } from "../services/api";

interface AuthProps {
  initialMode: 'login' | 'signup';
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => void;
  onBack: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password';
type AuthStep = 'credentials' | 'otp';

const OTP_COOLDOWN_SECONDS = 30;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const Auth: React.FC<AuthProps> = ({ initialMode, onLogin, onSignup, onBack }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>('credentials');

  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Logic
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpCreatedAt, setOtpCreatedAt] = useState<number>(0);
  const [lastOtpSentAt, setLastOtpSentAt] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Errors & Messages
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastOtpSentAt) / 1000);
      const remaining = OTP_COOLDOWN_SECONDS - elapsed;
      setCooldownRemaining(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining, lastOtpSentAt]);

  // --- OTP SEND with rate-limiting ---
  const handleSendOtp = useCallback(async () => {
    setError("");
    setMessage("");

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup" && (!name || !password)) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Rate-limit check: 30-second cooldown
    const timeSinceLastSend = Date.now() - lastOtpSentAt;
    if (timeSinceLastSend < OTP_COOLDOWN_SECONDS * 1000) {
      const remaining = Math.ceil((OTP_COOLDOWN_SECONDS * 1000 - timeSinceLastSend) / 1000);
      setError(`Please wait ${remaining}s before requesting another OTP.`);
      return;
    }

    setLoading(true);

    // Generate new OTP (invalidates any previous one)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCreatedAt(Date.now());

    try {
      const sent = await sendOtpEmail(email, code, name || undefined);
      if (!sent) {
        setError("Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      setLastOtpSentAt(Date.now());
      setCooldownRemaining(OTP_COOLDOWN_SECONDS);
      setOtpInput('');
      setMessage(`OTP sent to ${email}`);
      setStep("otp");
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, name, password, mode, lastOtpSentAt]);

  // --- OTP VERIFICATION with expiry ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!generatedOtp) {
      setError("No OTP was generated. Please request a new one.");
      return;
    }

    // Check expiry (5 minutes)
    if (Date.now() - otpCreatedAt > OTP_EXPIRY_MS) {
      setError("OTP has expired. Please request a new one.");
      setGeneratedOtp(null);
      return;
    }

    if (otpInput !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(email, password);
      onSignup(name, email, password);
    } catch (err: any) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendResetEmail(email);
      setMessage('Password reset email sent! Check your inbox and spam folder.');
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err?.message || 'Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const getTitle = () => {
    if (step === 'otp') return 'Verify Email';
    if (mode === 'signup') return 'Create Account';
    if (mode === 'forgot-password') return 'Reset Password';
    return 'Welcome Back';
  };

  const getSubtitle = () => {
    if (step === 'otp') return 'Enter the 6-digit code sent to your email';
    if (mode === 'signup') return 'Start your fitness journey today';
    if (mode === 'forgot-password') return 'We\'ll send a reset link to your email';
    return 'Enter your credentials to access your plan';
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep('credentials');
    setError('');
    setMessage('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtpInput('');
    setGeneratedOtp(null);
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      <Card className="max-w-md w-full relative z-10 animate-fade-in">
        <button
          onClick={() => {
            if (step !== 'credentials') {
              setStep('credentials');
              setError('');
              setMessage('');
            } else if (mode === 'forgot-password') {
              switchMode('login');
            } else {
              onBack();
            }
          }}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
          <p className="text-slate-400 text-sm mt-1">{getSubtitle()}</p>
        </div>

        {/* --- STEP 1: LOGIN / SIGNUP / FORGOT PASSWORD FORM --- */}
        {step === 'credentials' && (
          <form
            onSubmit={
              mode === "signup"
                ? (e) => { e.preventDefault(); handleSendOtp(); }
                : mode === "forgot-password"
                  ? handleForgotPassword
                  : handleLoginSubmit
            }
            className="space-y-4"
          >
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-slate-400">Password</label>
                </div>
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
                {mode === 'login' && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="text-xs text-primary hover:text-violet-400 font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">{error}</div>}
            {message && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs text-center">{message}</div>}

            <Button type="submit" fullWidth className="mt-4" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Please wait...
                </span>
              ) : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Send OTP Code' : 'Send Reset Link'}
            </Button>

            {/* Mode Switcher */}
            <p className="text-center text-xs text-slate-500 mt-4">
              {mode === 'login' ? "Don't have an account? " : mode === 'signup' ? "Already have an account? " : "Remember your password? "}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </form>
        )}

        {/* --- STEP 2: OTP VERIFICATION --- */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-center my-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <ShieldCheck className="text-primary w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 text-center block">Enter 6-Digit Code</label>
              <input
                type="text"
                value={otpInput}
                maxLength={6}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[1em] font-mono bg-slate-950 border border-slate-800 rounded-xl py-4 text-white focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-800"
              />
            </div>

            {/* Expiry notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Timer size={14} />
              <span>Code expires in 5 minutes</span>
            </div>

            {message && <p className="text-center text-green-400 text-xs">{message}</p>}
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">{error}</div>}

            <Button type="submit" fullWidth disabled={loading || otpInput.length !== 6}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : 'Verify & Continue'}
            </Button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={cooldownRemaining > 0 || loading}
              className={`w-full text-xs mt-2 transition-colors ${cooldownRemaining > 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-500 hover:text-white'
                }`}
            >
              {cooldownRemaining > 0
                ? `Resend in ${cooldownRemaining}s`
                : 'Resend Code'}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
};