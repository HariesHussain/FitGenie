import { AppState, UserProfile } from '../types';

const KEYS = {
  USER: 'fitgenie_user',
  WORKOUT: 'fitgenie_workout',
  MEAL: 'fitgenie_meal',
  HISTORY: 'fitgenie_history',
  MESSAGES: 'fitgenie_messages',
  SESSION: 'fitgenie_session_active',
  CREDS: 'fitgenie_credentials' // Stores email/password mapping
};

// --- User Profile Data (DEPRECATED — Firebase handles this) ---
 // saveUser and loadUser removed


// --- Generic State ---

export const saveState = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadState = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

export const clearData = () => {
  localStorage.clear();
};

// --- Session Management (DEPRECATED — Firebase handles sessions) ---
// startSession, endSession, hasSession removed


// --- Auth & Credentials (DEPRECATED — Firebase Auth is used) ---
// saveCredentials, verifyCredentials, checkEmailExists removed


export const STORAGE_KEYS = KEYS;