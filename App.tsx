import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Landing } from './views/Landing';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { WorkoutView } from './views/WorkoutView';
import { DietView } from './views/DietView';
import { ChatView } from './views/ChatView';
import { Auth } from './views/Auth';
import { UpdatePassword } from './views/UpdatePassword';
import { TrackerView } from './views/TrackerView';
import { ProfileView } from './views/ProfileView';

import { UserProfile, WorkoutDay, MealPlan, ChatMessage, FitnessLevel, BodyPart } from './types';

import { loadState, saveState, clearData, STORAGE_KEYS } from './services/storageService';

import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { loginWithEmail, loadUserProfile, saveUserProfile, saveWorkoutData, loadWorkoutData, saveExerciseLog, deleteExerciseLog, loadExerciseLogs } from "./services/api";

import { generateDailyMealPlan, generateTargetedWorkout } from './services/aiService';


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

  // Auto-login via Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let profile = null;
          try {
            profile = await loadUserProfile(firebaseUser.uid);
          } catch (profileErr) {
            console.error('loadUserProfile error:', profileErr);
          }

          if (profile) {
            setUser(profile);

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
          setUser(null);
          setWorkoutPlan([]);
          setMealHistory({});
          setMessages([]);
          setView(prev => {
            if (prev === 'update-password') return prev;
            return 'landing';
          });
        }
      } catch (err) {
        console.error('Auth state handler error:', err);
        setView('landing');
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartGuest = () => {
    const guestUser = {
      uid: "guest_" + Date.now(),
      email: "guest@example.com",
      displayName: "Guest User",
      isGuest: true,
    };
    setUser(guestUser as any);
    localStorage.setItem("fitgenie_user", JSON.stringify(guestUser));
    setView("onboarding");
  };

  const handleAuthNavigation = (target: "login" | "signup") => {
    setView(target);
  };

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
      if (auth.currentUser) {
        await signOut(auth);
      }

      setUser(null);
      setWorkoutPlan([]);
      setMealHistory({});
      setMessages([]);
      setTempAuthData({});

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
      localStorage.removeItem('fitgenie_user');
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

            let newLevel = user.level;
            let didUpgrade = false;

            if (user.level === 'Beginner' && totalWorkoutDays >= 10) {
              newLevel = 'Intermediate' as FitnessLevel;
              didUpgrade = true;
            } else if (user.level === 'Intermediate' && totalWorkoutDays >= 30) {
              newLevel = 'Advanced' as FitnessLevel;
              didUpgrade = true;
            }

            if (didUpgrade) {
              const updatedProfile = { ...user, level: newLevel };
              await handleUpdateProfile(updatedProfile);
              // Simple browser alert for the achievement (can be replaced with custom toast later)
              // Use setTimeout to allow the UI to finish rendering the exercise toggle first
              setTimeout(() => {
                alert(`🎉 CONGRATULATIONS! 🎉\n\nYou've completed ${totalWorkoutDays} workout days! Your Fitness Level has automatically upgraded to: ${newLevel.toUpperCase()}!\n\nYour future AI workouts will now be harder.`);
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

  // View Router
  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <Landing
            onStart={handleStartGuest}
            onLogin={() => handleAuthNavigation('login')}
            onSignup={() => handleAuthNavigation('signup')}
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
          />
        );
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse tracking-wide uppercase font-bold">Verifying Session...</p>
      </div>
    );
  }

  if (['landing', 'login', 'signup', 'onboarding', 'update-password'].includes(view)) {
    return <div className="min-h-screen bg-background text-slate-100 font-sans">{renderView()}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans">
      <Layout currentView={view} onNavigate={setView} onLogout={handleLogout} user={user}>
        {renderView()}
      </Layout>
    </div>
  );
};

export default App;