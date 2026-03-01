// services/api.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { UserProfile, ExerciseLog } from "../types";

// ======================================================================
// AUTH FUNCTIONS
// ======================================================================

// 🔹 Signup → Firebase Authentication
export async function signupWithEmail(
  email: string,
  password: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// 🔹 Login → Firebase Authentication
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// 🔹 Forgot Password → sends Firebase reset email
export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// 🔹 Confirm password reset using the oobCode from Firebase email link
export async function confirmReset(
  oobCode: string,
  newPassword: string
): Promise<void> {
  await confirmPasswordReset(auth, oobCode, newPassword);
}

// ======================================================================
// FIRESTORE USER DATA
// ======================================================================

// 🔹 Save user profile after onboarding
export async function saveUserProfile(
  uid: string,
  profile: UserProfile
): Promise<void> {
  await setDoc(doc(db, "users", uid), profile, { merge: true });
}

// 🔹 Load user profile on login
export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// ======================================================================
// MEAL HISTORY
// ======================================================================

export async function getMealHistoryForUser(uid: string) {
  try {
    const ref = doc(db, "user_data", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return data?.mealHistory || null;
  } catch (err) {
    console.error("getMealHistoryForUser error:", err);
    return null;
  }
}

export async function saveMealHistoryForUser(uid: string, mealHistory: Record<string, any>) {
  try {
    const ref = doc(db, "user_data", uid);
    await setDoc(ref, { mealHistory }, { merge: true });
    return true;
  } catch (err) {
    console.error("saveMealHistoryForUser error:", err);
    return false;
  }
}

// ======================================================================
// WORKOUT DATA
// ======================================================================

export async function saveWorkoutData(uid: string, workoutPlan: any[]) {
  try {
    const ref = doc(db, "user_data", uid);
    await setDoc(ref, { workoutPlan }, { merge: true });
    return true;
  } catch (err) {
    console.error("saveWorkoutData error:", err);
    return false;
  }
}

export async function loadWorkoutData(uid: string) {
  try {
    const ref = doc(db, "user_data", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data()?.workoutPlan || null;
  } catch (err) {
    console.error("loadWorkoutData error:", err);
    return null;
  }
}

// ======================================================================
// EXERCISE TRACKER LOGS
// ======================================================================

export async function saveExerciseLog(uid: string, log: ExerciseLog): Promise<string> {
  if (!uid || uid.startsWith("guest_") || !auth.currentUser) {
    const logs: ExerciseLog[] = JSON.parse(localStorage.getItem("fitgenie_local_logs") || "[]");
    const newLog = { ...log, id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` };
    logs.push(newLog);
    localStorage.setItem("fitgenie_local_logs", JSON.stringify(logs));
    return newLog.id;
  }
  const ref = collection(db, "users", uid, "exercise_logs");
  const docRef = await addDoc(ref, log);
  return docRef.id;
}

export async function loadExerciseLogs(uid: string, dateStr?: string): Promise<ExerciseLog[]> {
  try {
    if (!uid || uid.startsWith("guest_") || !auth.currentUser) {
      let logs: ExerciseLog[] = JSON.parse(localStorage.getItem("fitgenie_local_logs") || "[]");
      if (dateStr) {
        logs = logs.filter((l) => l.date === dateStr);
      }
      return logs.sort((a, b) => b.timestamp - a.timestamp);
    }
    const ref = collection(db, "users", uid, "exercise_logs");
    let q;
    if (dateStr) {
      q = query(ref, where("date", "==", dateStr), orderBy("timestamp", "desc"));
    } else {
      q = query(ref, orderBy("timestamp", "desc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Record<string, any>), id: d.id } as ExerciseLog));
  } catch (err) {
    console.error("loadExerciseLogs error:", err);
    return [];
  }
}

export async function deleteExerciseLog(uid: string, logId: string): Promise<void> {
  if (!uid || uid.startsWith("guest_") || !auth.currentUser) {
    let logs: ExerciseLog[] = JSON.parse(localStorage.getItem("fitgenie_local_logs") || "[]");
    logs = logs.filter((l) => l.id !== logId);
    localStorage.setItem("fitgenie_local_logs", JSON.stringify(logs));
    return;
  }
  await deleteDoc(doc(db, "users", uid, "exercise_logs", logId));
}
