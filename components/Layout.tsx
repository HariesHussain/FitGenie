import React, { useState } from 'react';
import { Home, Dumbbell, Utensils, MessageSquare, User, LogOut, ClipboardList } from 'lucide-react';

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
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Logo / title */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FitGenie
            </span>
          </div>

          {/* Right side: desktop nav + mobile logout */}
          <div className="flex items-center gap-3">
            {/* Desktop Nav (hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === item.id ? 'text-secondary' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <div className="h-4 w-px bg-slate-800 mx-2"></div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 hidden lg:block">Hi, {user?.name || 'User'}</span>
                <button onClick={() => setShowLogoutConfirm(true)} className="text-slate-400 hover:text-red-400">
                  <LogOut size={18} />
                </button>
              </div>
            </nav>

            {/* Mobile logout button (visible on small screens) — sits at top-right */}
            <div className="md:hidden">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-slate-400 hover:text-red-400 p-2"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-surfaceHighlight/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${currentView === item.id
              ? 'bg-primary/20 text-primary scale-110'
              : 'text-slate-400'
              }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surfaceHighlight border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-2">Ready to leave?</h3>
            <p className="text-slate-400 text-sm mb-6">
              You are about to log out of FitGenie. You will need to enter your password the next time you open the app.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};