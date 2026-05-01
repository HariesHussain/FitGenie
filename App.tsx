import React, { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Layout } from './components/Layout';
import { Landing } from './views/Landing';

import { UserProfile, WorkoutDay, MealPlan, ChatMessage, FitnessLevel, BodyPart } from './types';

import { loadState, saveState, clearData, STORAGE_KEYS } from './services/storageService';

import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { loginWithEmail, loadUserProfile, saveUserProfile, saveWorkoutData, loadWorkoutData, saveExerciseLog, deleteExerciseLog, loadExerciseLogs } from "./services/api";

import { generateDailyMealPlan, generateTargetedWorkout } from './services/aiService';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const Onboarding = React.lazy(() => import('./views/Onboarding').then(module => ({ default: module.Onboarding })));
const Dashboard = React.lazy(() => import('./views/Dashboard').then(module => ({ default: module.Dashboard })));
const WorkoutView = React.lazy(() => import('./views/WorkoutView').then(module => ({ default: module.WorkoutView })));
const DietView = React.lazy(() => import('./views/DietView').then(module => ({ default: module.DietView })));
const ChatView = React.lazy(() => import('./views/ChatView').then(module => ({ default: module.ChatView })));
const Auth = React.lazy(() => import('./views/Auth').then(module => ({ default: module.Auth })));
const UpdatePassword = React.lazy(() => import('./views/UpdatePassword').then(module => ({ default: module.UpdatePassword })));
const TrackerView = React.lazy(() => import('./views/TrackerView').then(module => ({ default: module.TrackerView })));
const ProfileView = React.lazy(() => import('./views/ProfileView').then(module => ({ default: module.ProfileView })));


const App = () => {
  // Global State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);

  // Diet State
  const [mealHistory, setMealHistory] = useState<Record<string, MealPlan>>({});
  const [dateOffset, setDateOffset] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [tempAuthData, setTempAuthData] = useState<Partial<UserProfile>>({});
  const [exerciseLogMap, setExerciseLogMap] = useState<Record<string, string>>({}); // exerciseId -> firestore docId

  // Navigation State
  const [view, setView] = useState('landing');
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [downloadHint, setDownloadHint] = useState<string>('');

  // Helpers
  const getDateKey = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const getDisplayDate = (offset: number) => {
    if (offset === 0) return 'Today';
    if (offset === -1) return 'Yesterday';
    if (offset === 1) return 'Tomorrow';
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Check for Firebase password reset link on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const code = params.get('oobCode');

    if (mode === 'resetPassword' && code) {
      setOobCode(code);
      setView('update-password');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  // Auto-login via Firebase Auth
  useEffect(() => {
    let isMounted = true;
    const authWatchdog = window.setTimeout(() => {
      if (isMounted) {
        setIsAuthLoading(false);
      }
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      try {
        if (firebaseUser) {
          const cachedProfile = loadState<UserProfile | null>(STORAGE_KEYS.USER, null);
          if (cachedProfile) {
            setUser(cachedProfile);
            setWorkoutPlan(loadState<WorkoutDay[]>(STORAGE_KEYS.WORKOUT, []));
            const cachedMeals = loadState<Record<string, MealPlan> | MealPlan | null>(STORAGE_KEYS.MEAL, {});
            if (cachedMeals && 'breakfast' in (cachedMeals as any)) {
              setMealHistory({ [getDateKey(0)]: cachedMeals as MealPlan });
            } else {
              setMealHistory((cachedMeals as Record<string, MealPlan>) || {});
            }
            setMessages(loadState<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []));
            setView(prev => (prev === 'update-password' ? prev : 'dashboard'));
          }

          // Resolve auth gate immediately, then hydrate from network.
          setIsAuthLoading(false);

          let profile = null;
          try {
            profile = await loadUserProfile(firebaseUser.uid);
          } catch (profileErr) {
            console.error('loadUserProfile error:', profileErr);
          }

          if (profile) {
            setUser(profile);
            saveState(STORAGE_KEYS.USER, profile);

            // Load workout data from Firestore
            let wPlan = null;
            try {
              wPlan = await loadWorkoutData(firebaseUser.uid);
            } catch { }

            let currentPlan = wPlan || loadState<WorkoutDay[]>(STORAGE_KEYS.WORKOUT, []);

            // --- DAILY WORKOUT RESET ---
            const todayStr = new Date().toLocaleDateString('en-CA');
            if (currentPlan.length > 0) {
              const workoutDate = currentPlan[0].date;
              // If the workout has a date and it's not today, reset it!
              if (workoutDate && workoutDate !== todayStr) {
                currentPlan = [];
                saveState(STORAGE_KEYS.WORKOUT, currentPlan);
                saveWorkoutData(firebaseUser.uid, currentPlan).catch(() => { });
              }
            }

            setWorkoutPlan(currentPlan);

            const savedHistory = loadState<Record<string, MealPlan> | MealPlan | null>(STORAGE_KEYS.MEAL, {});
            if (savedHistory && 'breakfast' in (savedHistory as any)) {
              setMealHistory({ [getDateKey(0)]: savedHistory as MealPlan });
            } else {
              setMealHistory((savedHistory as Record<string, MealPlan>) || {});
            }

            setMessages(loadState<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []));

            // Navigate to dashboard ONLY if not already on a valid view and not resetting password
            setView(prev => {
              if (prev === 'update-password') return prev;
              return 'dashboard';
            });
          } else {
            setTempAuthData({ email: firebaseUser.email || undefined });
            setView(prev => {
              if (prev === 'update-password') return prev;
              return 'onboarding';
            });
          }
        } else {
          // No Firebase user - Check for guest session
          const guestStr = localStorage.getItem("fitgenie_user");
          if (guestStr) {
            try {
              const guestProfile = JSON.parse(guestStr);
              if (guestProfile.isGuest) {
                setUser(guestProfile);
                setWorkoutPlan(loadState<WorkoutDay[]>(STORAGE_KEYS.WORKOUT, []));
                setMealHistory(loadState<Record<string, MealPlan>>(STORAGE_KEYS.MEAL, {}));
                setMessages(loadState<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []));
                setView(prev => {
                  if (prev === 'update-password') return prev;
                  return 'dashboard';
                });
                setIsAuthLoading(false);
                return;
              }
            } catch (e) {
              console.error("Guest parse error", e);
            }
          }
          
          setUser(null);
          setWorkoutPlan([]);
          setMealHistory({});
          setMessages([]);
          setView(prev => {
            if (prev === 'update-password') return prev;
            return 'landing';
          });
          setIsAuthLoading(false);
        }
      } catch (err) {
        console.error('Auth state handler error:', err);
        setView('landing');
        setIsAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      window.clearTimeout(authWatchdog);
      unsubscribe();
    };
  }, []);

  const handleStartGuest = () => {
    // Check if a guest profile already exists
    const existingGuestStr = localStorage.getItem("fitgenie_user");
    let guestUser;

    if (existingGuestStr) {
      try {
        const existing = JSON.parse(existingGuestStr);
        if (existing.isGuest) {
          // Reuse existing guest profile
          guestUser = existing;
        } else {
          // Not a guest, create new
          guestUser = {
            uid: "guest_" + Date.now(),
            email: "guest@example.com",
            displayName: "Guest User",
            isGuest: true,
          };
        }
      } catch (e) {
        // Parse error, create new guest
        guestUser = {
          uid: "guest_" + Date.now(),
          email: "guest@example.com",
          displayName: "Guest User",
          isGuest: true,
        };
      }
    } else {
      // No existing guest, create new
      guestUser = {
        uid: "guest_" + Date.now(),
        email: "guest@example.com",
        displayName: "Guest User",
        isGuest: true,
      };
    }

    setUser(guestUser as any);
    localStorage.setItem("fitgenie_user", JSON.stringify(guestUser));

    // If guest already has onboarding data (has fitness level set), go to dashboard
    if (guestUser.fitnessLevel) {
      // Load existing guest data
      setWorkoutPlan(loadState<WorkoutDay[]>(STORAGE_KEYS.WORKOUT, []));
      setMealHistory(loadState<Record<string, MealPlan>>(STORAGE_KEYS.MEAL, {}));
      setMessages(loadState<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []));
      setView("dashboard");
    } else {
      // New guest or incomplete onboarding, go to onboarding
      setView("onboarding");
    }
  };

  const handleAuthNavigation = (target: "login" | "signup") => {
    setView(target);
  };

  const handleDownloadApp = useCallback(async () => {
    setDownloadHint('');
    
    // 1. Try native install prompt (PWA or Chrome)
    if (installPrompt) {
      await installPrompt.prompt();
      try {
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'dismissed') {
          setDownloadHint('Install prompt closed. You can tap Download App again anytime.');
        }
      } finally {
        setInstallPrompt(null);
      }
      return;
    }

    // 2. Check device type
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    // 3. Android: Download APK or show build instructions
    if (isAndroid) {
      const apkUrl = import.meta.env.VITE_ANDROID_APK_URL || '/fitgenie-latest.apk';
      
      // Start download directly without fetch check (avoids CORS issues on GitHub URLs)
      window.location.href = apkUrl;
      setDownloadHint('✓ APK download started. Check your Downloads folder.');
      return;
    }

    // 4. iOS: Show Safari instructions
    if (isIos) {
      setDownloadHint('📱 On iPhone/iPad:\n\n1. Open in Safari\n2. Tap Share button\n3. Tap "Add to Home Screen"\n4. Tap "Add"\n\nFitGenie will appear on your home screen as an app!');
      return;
    }

    // 5. Desktop: Show PWA instructions
    setDownloadHint('💻 To install FitGenie on your computer:\n\nChrome/Edge: Look for the install icon (⬇️) in address bar or 3-dot menu > "Install app"\n\nSafari: File > Add to Dock\n\nOr just use it as a web app!');
  }, [installPrompt]);

  // Login — returns a promise so Auth.tsx can await it and catch errors
  const handleLoginSubmit = async (email: string, password: string) => {
    // Just call Firebase auth — onAuthStateChanged will handle navigation
    await loginWithEmail(email, password);
  };

  const handleSignupSubmit = (name: string, email: string, password: string) => {
    setTempAuthData({ name, email, isGuest: false });
    setView('onboarding');
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setUser(profile);

    const wPlan: WorkoutDay[] = [];
    const todayKey = getDateKey(0);
    const initialMealPlan = generateDailyMealPlan(profile);
    const initialHistory = { [todayKey]: initialMealPlan };

    setWorkoutPlan(wPlan);
    setMealHistory(initialHistory);

    saveState(STORAGE_KEYS.WORKOUT, wPlan);
    saveState(STORAGE_KEYS.MEAL, initialHistory);

    try {
      if (auth.currentUser && auth.currentUser.uid) {
        await saveUserProfile(auth.currentUser.uid, profile);
        localStorage.setItem('fitgenie_user', JSON.stringify(profile));
      } else {
        const guestUid = (profile as any).uid || `guest_${Date.now()}`;
        const guestProfile = { ...(profile as any), uid: guestUid, isGuest: true };
        localStorage.setItem('fitgenie_user', JSON.stringify(guestProfile));
        setUser(guestProfile as unknown as UserProfile);
      }
    } catch (err) {
      console.error('Failed saving profile after onboarding:', err);
    }

    setView('dashboard');
  };

  const handleUpdateWorkout = (target: BodyPart, level: FitnessLevel) => {
    if (!user) return;
    const newWorkout = generateTargetedWorkout(target, level);
    const newPlan = [newWorkout];
    setWorkoutPlan(newPlan);
    saveState(STORAGE_KEYS.WORKOUT, newPlan);

    // Save to Firestore
    if (auth.currentUser) {
      saveWorkoutData(auth.currentUser.uid, newPlan).catch(() => { });
    }
  };

  const handleResetWorkout = () => {
    setWorkoutPlan([]);
    saveState(STORAGE_KEYS.WORKOUT, []);
    if (auth.currentUser) {
      saveWorkoutData(auth.currentUser.uid, []).catch(() => { });
    }
  };

  const handleLogout = async () => {
    try {
      // Preserve guest session if user is a guest
      const isGuest = (user as any)?.isGuest === true;

      if (auth.currentUser) {
        await signOut(auth);
      }

      setUser(null);
      setWorkoutPlan([]);
      setMealHistory({});
      setMessages([]);
      setTempAuthData({});

      // Clear session data for everyone
      localStorage.removeItem('fitgenie_user');
      localStorage.removeItem('fitgenie_workout');
      localStorage.removeItem('fitgenie_meal');
      localStorage.removeItem('fitgenie_messages');
      localStorage.removeItem('fitgenie_history');

      setView('landing');
    } catch (err: any) {
      console.error('Logout failed:', err);
      setUser(null);
      setWorkoutPlan([]);
      setMealHistory({});
      setMessages([]);
      // Preserve guest user even on error
      if ((user as any)?.isGuest !== true) {
        localStorage.removeItem('fitgenie_user');
      }
      setView('landing');
    }
  };

  const handleToggleExercise = async (dayIndex: number, exerciseId: string) => {
    const newPlan = [...workoutPlan];
    const day = newPlan[dayIndex];
    if (!day) return;

    const exercise = day.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      exercise.completed = !exercise.completed;
      setWorkoutPlan(newPlan);
      saveState(STORAGE_KEYS.WORKOUT, newPlan);

      if (auth.currentUser) {
        saveWorkoutData(auth.currentUser.uid, newPlan).catch(() => { });
      }

      const userUid = auth.currentUser?.uid || (user as any)?.uid || (user as any)?.id || "guest_1";

      // Auto-log to tracker when completed
      if (exercise.completed) {
        try {
          const repsNum = parseInt(exercise.reps) || 10;

          // Generate local date string safely without offset issues
          const d = new Date();
          const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

          const log = {
            id: '',
            exerciseName: exercise.name,
            bodyPart: exercise.muscleGroup || 'Full Body',
            sets: exercise.sets,
            reps: repsNum,
            weight: 0,
            duration: 0,
            date: localDateStr,
            timestamp: Date.now(),
            notes: `Auto-logged from workout: ${day.day}`,
          };
          const docId = await saveExerciseLog(userUid, log);
          setExerciseLogMap(prev => ({ ...prev, [exerciseId]: docId }));
        } catch (err) {
          console.error('Auto-log exercise failed:', err);
        }
      } else {
        // Un-toggle: remove the auto-logged entry
        const logDocId = exerciseLogMap[exerciseId];
        if (logDocId) {
          try {
            await deleteExerciseLog(userUid, logDocId);
            setExerciseLogMap(prev => {
              const copy = { ...prev };
              delete copy[exerciseId];
              return copy;
            });
          } catch (err) {
            console.error('Auto-delete exercise log failed:', err);
          }
        }
      }

      const allComplete = day.exercises.every(e => e.completed);
      if (allComplete && !day.completed) {
        day.completed = true;
        setWorkoutPlan([...newPlan]); // Force re-render of day completion

        // --- SMART FITNESS LEVEL PROGRESSION ---
        if (user) {
          try {
            // Get all logs to count unique workout days
            const allLogs = await loadExerciseLogs(userUid);
            const uniqueDates = new Set(allLogs.map(l => l.date));
            const totalWorkoutDays = uniqueDates.size;

            let newLevel = user.fitnessLevel;
            let didUpgrade = false;

            if (user.fitnessLevel === 'Beginner' && totalWorkoutDays >= 10) {
              newLevel = 'Intermediate' as FitnessLevel;
              didUpgrade = true;
            } else if (user.fitnessLevel === 'Intermediate' && totalWorkoutDays >= 30) {
              newLevel = 'Advanced' as FitnessLevel;
              didUpgrade = true;
            }

            if (didUpgrade) {
              const updatedProfile = { ...user, fitnessLevel: newLevel };
              await handleUpdateProfile(updatedProfile);
              // Simple browser alert for the achievement (can be replaced with custom toast later)
              // Use setTimeout to allow the UI to finish rendering the exercise toggle first
              setTimeout(() => {
                alert(`Congratulations!\n\nYou've completed ${totalWorkoutDays} workout days. Your fitness level has been upgraded to ${newLevel}.\n\nFuture workouts will now be more challenging.`);
              }, 500);
            }
          } catch (err) {
            console.error("Failed to check smart progression:", err);
          }
        }
      }
    }
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('fitgenie_user', JSON.stringify(profile));
    if (auth.currentUser) {
      await saveUserProfile(auth.currentUser.uid, profile);
    }
  };

  // --- Diet Handlers ---
  const handleRegenerateDiet = () => {
    if (!user) return;
    const key = getDateKey(dateOffset);
    const newPlan = generateDailyMealPlan(user);
    const newHistory = { ...mealHistory, [key]: newPlan };
    setMealHistory(newHistory);
    saveState(STORAGE_KEYS.MEAL, newHistory);
  };

  const handleDietDateChange = (change: number) => {
    const newOffset = dateOffset + change;
    setDateOffset(newOffset);

    const newKey = getDateKey(newOffset);
    if (!mealHistory[newKey] && user) {
      const newPlan = generateDailyMealPlan(user);
      const newHistory = { ...mealHistory, [newKey]: newPlan };
      setMealHistory(newHistory);
      saveState(STORAGE_KEYS.MEAL, newHistory);
    }
  };

  const handleAddMessage = (msg: ChatMessage) => {
    setMessages(prevMessages => {
      const newMsgs = [...prevMessages, msg];
      saveState(STORAGE_KEYS.MESSAGES, newMsgs);
      return newMsgs;
    });
  };

  const currentMealPlan = mealHistory[getDateKey(dateOffset)];

  const viewFallback = (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
    </div>
  );

  // View Router
  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <Landing
            onStart={handleStartGuest}
            onLogin={() => handleAuthNavigation('login')}
            onSignup={() => handleAuthNavigation('signup')}
            onDownloadApp={handleDownloadApp}
            downloadHint={downloadHint}
          />
        );
      case 'login':
        return (
          <Auth
            initialMode="login"
            onLogin={handleLoginSubmit}
            onSignup={handleSignupSubmit}
            onBack={() => setView('landing')}
          />
        );
      case 'signup':
        return (
          <Auth
            initialMode="signup"
            onLogin={handleLoginSubmit}
            onSignup={handleSignupSubmit}
            onBack={() => setView('landing')}
          />
        );
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} initialData={tempAuthData} />;
      case 'dashboard':
        return (
          <Dashboard
            user={user!}
            todaysWorkout={workoutPlan[0]}
            mealPlan={mealHistory[getDateKey(0)]}
            onNavigate={setView}
            onUpdateWorkout={handleUpdateWorkout}
            onResetWorkout={handleResetWorkout}
          />
        );
      case 'workout':
        return <WorkoutView plan={workoutPlan} onToggleExercise={handleToggleExercise} />;
      case 'diet': {
        const key = getDateKey(dateOffset);
        if (!mealHistory[key] && user) {
          const newPlan = generateDailyMealPlan(user);
          const newHistory = { ...mealHistory, [key]: newPlan };
          setMealHistory(newHistory);
          saveState(STORAGE_KEYS.MEAL, newHistory);
          return null;
        }

        const current = mealHistory[key];
        if (!current) {
          return (
            <div className="text-center text-slate-400 mt-10">
              Loading meal plan...
            </div>
          );
        }

        return (
          <DietView
            mealPlan={current}
            dateLabel={getDisplayDate(dateOffset)}
            onNextDay={() => handleDietDateChange(1)}
            onPrevDay={() => handleDietDateChange(-1)}
            onRegenerate={handleRegenerateDiet}
          />
        );
      }
      case 'chat':
        // AI Coach is disabled on native Android/iOS
        if (Capacitor.isNativePlatform()) {
          setView('dashboard');
          return null;
        }
        return <ChatView messages={messages} onAddMessage={handleAddMessage} />;
      case 'tracker':
        return <TrackerView user={user} />;
      case 'profile':
        return user ? <ProfileView user={user} onUpdateProfile={handleUpdateProfile} /> : null;
      case 'update-password':
        return (
          <UpdatePassword
            oobCode={oobCode || ''}
            onDone={() => {
              setOobCode(null);
              setView('login');
            }}
          />
        );
      default:
        return (
          <Landing
            onStart={handleStartGuest}
            onLogin={() => handleAuthNavigation('login')}
            onSignup={() => handleAuthNavigation('signup')}
            onDownloadApp={handleDownloadApp}
            downloadHint={downloadHint}
          />
        );
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      </div>
    );
  }

  if (['landing', 'login', 'signup', 'onboarding', 'update-password'].includes(view)) {
    return (
      <div className="min-h-screen bg-background text-slate-100 font-sans">
        <React.Suspense fallback={viewFallback}>{renderView()}</React.Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans">
      <Layout currentView={view} onNavigate={setView} onLogout={handleLogout} user={user}>
        <React.Suspense fallback={viewFallback}>{renderView()}</React.Suspense>
      </Layout>
    </div>
  );
};

export default App;
