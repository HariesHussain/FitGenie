export enum Goal {
  GAIN = 'Muscle Gain'
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary',
  LIGHT = 'Light Active',
  MODERATE = 'Moderately Active',
  ACTIVE = 'Very Active'
}

export enum FitnessLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum Location {
  GYM = 'Gym'
}

export enum Gender {
  MALE = 'Male'
}

export enum BodyPart {
  FULL_BODY = 'Full Body',
  CHEST = 'Chest',
  BACK = 'Back',
  LEGS = 'Legs',
  SHOULDERS = 'Shoulders',
  ARMS = 'Arms',
  CORE = 'Core'
}

export interface UserProfile {
  name: string;
  email?: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  fitnessLevel: FitnessLevel;
  goal: Goal;
  isGuest: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  equipment: string;
  completed: boolean;
  notes?: string;
  videoUrl?: string; // URL to MP4/WebM
  thumbnailUrl?: string; // Fallback image
}

export interface WorkoutDay {
  day: string; // e.g., "Day 1 - Push"
  exercises: Exercise[];
  completed: boolean;
  date?: string; // YYYY-MM-DD local ISO format
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: string[];
  image?: string;
}

export interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
  totalCalories: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface ExerciseLog {
  id: string;
  exerciseName: string;
  bodyPart: string;
  sets: number;
  reps: number;
  weight: number; // kg
  duration: number; // minutes (0 if N/A)
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  notes?: string;
}

export interface AppState {
  user: UserProfile | null;
  workoutPlan: WorkoutDay[];
  mealPlan: MealPlan | null;
  messages: ChatMessage[];
  exerciseLogs: ExerciseLog[];
  weightHistory: { date: string; weight: number }[];
}