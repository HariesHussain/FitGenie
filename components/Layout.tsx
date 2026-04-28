import React, { useState } from 'react';
import { Home, Dumbbell, Utensils, MessageSquare, User, LogOut, ClipboardList, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, onLogout, user }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'tracker', label: 'Tracker', icon: ClipboardList },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'chat', label: 'Coach', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-soft">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 animate-slide-up">
          <button className="flex items-center gap-3 transition-transform hover:scale-105" onClick={() => onNavigate('dashboard')}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-textMain font-heading">FitGenie</span>
          </button>

          <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  currentView === item.id
                    ? 'bg-white text-primary shadow-soft'
                    : 'text-slate-600 hover:bg-white hover:text-textMain'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-soft lg:flex">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700">{user?.name || 'User'}</span>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12 animate-fade-in">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center bg-white/98 px-2 pb-6 pt-3 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] backdrop-blur-xl md:hidden animate-slide-up border-t border-slate-200">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center flex-1 transition-all duration-300 ${
                currentView === item.id ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <item.icon size={currentView === item.id ? 24 : 22} className="mb-1 transition-all duration-300" />
            <span className={`text-[10px] font-bold tracking-wide transition-all ${currentView === item.id ? 'opacity-100 max-h-4 mt-0.5' : 'opacity-0 max-h-0'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-float animate-slide-up">
            <h3 className="text-2xl font-bold text-textMain mb-2">Log out of FitGenie?</h3>
            <p className="text-[15px] leading-relaxed text-textMuted mb-8">
              You'll be signed out from your account.
            </p>
            <div className="flex justify-end gap-3 cursor-pointer">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-soft"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
