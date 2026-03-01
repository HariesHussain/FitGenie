import { UserProfile, WorkoutDay, MealPlan, Goal, Exercise, Meal, FitnessLevel, BodyPart, ChatMessage } from '../types';
import { GoogleGenAI } from "@google/genai";

// ==============================================================================
// 🤖 REAL AI INTEGRATION (GEMINI API)
// ==============================================================================

/**
 * TODO: AFTER DOWNLOAD: PASTE YOUR GEMINI API KEY BELOW IF RUNNING LOCALLY
 *
 * 1. Go to https://aistudio.google.com/app/apikey to get a free API Key.
 * 2. Paste it inside the quotes for FALLBACK_API_KEY below.
 * 3. The code checks process.env.API_KEY first (for AI Studio), then uses this fallback.
 */
const FALLBACK_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const apiKey = process.env.API_KEY || FALLBACK_API_KEY;

if (!apiKey) {
  console.warn("⚠️ No API Key found. The Chat Coach will not work until you add a key in services/aiService.ts");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// ==============================================================================
// 🏋️ EXERCISE NAME CONSTANTS (Single Source of Truth)
// ==============================================================================

export const EX = {
  // ===== LEGS =====
  LEGS: {
    BARBELL_BACK_SQUAT: 'Barbell Back Squat',       // ✅ Video: barbell-back-squat.mp4
    ROMANIAN_DEADLIFT: 'Romanian Deadlift',        // ✅ Video: romanian-deadlift.mp4
    LEG_PRESS: 'Leg Press',                // ✅ Video: leg-press.mp4
    WALKING_LUNGES: 'Walking Lunges',           // ✅ Video: walking-lunges.mp4
    LEG_EXTENSIONS: 'Leg Extensions',           // ✅ Video: leg-extensions.mp4
    HAMSTRING_CURL: 'Hamstring Curl',           // ✅ Video: hamstring-curl.mp4
    STANDING_CALF_RAISE: 'Standing Calf Raise',      // ✅ Video: standing-calf-raise.mp4
    BULGARIAN_SPLIT_SQUAT: 'Bulgarian Split Squat',    // ✅ Video: bulgarian-split-squat.mp4
  },

  // ===== CHEST =====
  CHEST: {
    BARBELL_BENCH_PRESS: 'Barbell Bench Press',      // ✅ Video: barbell-bench-press.mp4
    INCLINE_DUMBBELL_PRESS: 'Incline Dumbbell Press',   // ✅ Video: incline-dumbbell-press.mp4
    INCLINE_BENCH_PRESS: 'Incline Bench Press',      // ✅ Video: incline-bench-press.mp4
    CHEST_DIPS_WEIGHTED: 'Chest Dips',           // ✅ Video: chest-dips.mp4
    PEC_DECK_MACHINE: 'Pec Deck Machine',         // ✅ Video: pec-deck-machine.mp4
    DECLINE_PUSH_UPS: 'Decline Push-ups',         // ✅ Video: decline-push-ups.mp4
    DUMBBELL_PULLOVER: 'Dumbbell Pullover',        // ✅ Video: dumbbell-pullover.mp4
  },

  // ===== BACK =====
  // 🎥 ADD YOUR VIDEOS: Place mp4 files in /public/videos/ named by slug.
  //    e.g. for 'Lat Pulldown (Wide Grip)' → /public/videos/lat-pulldown-wide-grip.mp4
  BACK: {
    DEADLIFT: 'Deadlift',                    // ✅ Video: deadlift.mp4
    LAT_PULLDOWN: 'Lat Pulldown (Wide Grip)',     // 🎥 ADD YOUR VIDEO → /public/videos/lat-pulldown-wide-grip.mp4
    SEATED_CABLE_ROW: 'Seated Cable Row',            // 🎥 ADD YOUR VIDEO → /public/videos/seated-cable-row.mp4
    SINGLE_ARM_DUMBBELL_ROW: 'Single Arm Dumbbell Row',     // 🎥 ADD YOUR VIDEO → /public/videos/single-arm-dumbbell-row.mp4
    FACE_PULLS: 'Face Pulls',                  // 🎥 ADD YOUR VIDEO → /public/videos/face-pulls.mp4
    PULL_UPS_WEIGHTED: 'Pull-ups',                  // 🎥 ADD YOUR VIDEO → /public/videos/pull-ups-weighted.mp4
    STRAIGHT_ARM_PULLDOWN: 'Straight Arm Pulldown',       // 🎥 ADD YOUR VIDEO → /public/videos/straight-arm-pulldown.mp4
  },

  // ===== SHOULDERS =====
  // 🎥 ADD YOUR VIDEOS: Place mp4 files in /public/videos/ named by slug.
  SHOULDERS: {
    OVERHEAD_BARBELL_PRESS: 'Overhead Barbell Press',      // 🎥 ADD YOUR VIDEO → /public/videos/overhead-barbell-press.mp4
    DUMBBELL_LATERAL_RAISES: 'Dumbbell Lateral Raises',     // 🎥 ADD YOUR VIDEO → /public/videos/dumbbell-lateral-raises.mp4
    DUMBBELL_FRONT_RAISES: 'Dumbbell Front Raises',       // 🎥 ADD YOUR VIDEO → /public/videos/dumbbell-front-raises.mp4
    REAR_DELT_FLYS: 'Rear Delt Flys',              // 🎥 ADD YOUR VIDEO → /public/videos/rear-delt-flys.mp4
    ARNOLD_PRESS: 'Arnold Press',                // 🎥 ADD YOUR VIDEO → /public/videos/arnold-press.mp4
    UPRIGHT_ROWS: 'Upright Rows',                // 🎥 ADD YOUR VIDEO → /public/videos/upright-rows.mp4
    CABLE_LATERAL_RAISES: 'Cable Lateral Raises',        // 🎥 ADD YOUR VIDEO → /public/videos/cable-lateral-raises.mp4
    SHRUGS: 'Shrugs',                      // 🎥 ADD YOUR VIDEO → /public/videos/shrugs.mp4
  },

  // ===== ARMS =====
  // 🎥 ADD YOUR VIDEOS: Place mp4 files in /public/videos/ named by slug.
  ARMS: {
    BARBELL_BICEP_CURL: 'Barbell Bicep Curl',          // 🎥 ADD YOUR VIDEO → /public/videos/barbell-bicep-curl.mp4
    TRICEP_ROPE_PUSHDOWN: 'Tricep Rope Pushdown',        // 🎥 ADD YOUR VIDEO → /public/videos/tricep-rope-pushdown.mp4
    HAMMER_CURLS: 'Hammer Curls',                // 🎥 ADD YOUR VIDEO → /public/videos/hammer-curls.mp4
    SKULLCRUSHERS: 'Skullcrushers',               // 🎥 ADD YOUR VIDEO → /public/videos/skullcrushers.mp4
    PREACHER_CURLS: 'Preacher Curls',              // 🎥 ADD YOUR VIDEO → /public/videos/preacher-curls.mp4
    OVERHEAD_TRICEP_EXTENSION: 'Overhead Tricep Extension',   // 🎥 ADD YOUR VIDEO → /public/videos/overhead-tricep-extension.mp4
    CONCENTRATION_CURLS: 'Concentration Curls',         // 🎥 ADD YOUR VIDEO → /public/videos/concentration-curls.mp4
    TRICEP_DIPS_WEIGHTED: 'Tricep Dips (Weighted)',       // 🎥 ADD YOUR VIDEO → /public/videos/tricep-dips-weighted.mp4
    REVERSE_GRIP_CURLS: 'Reverse Grip Curls',          // 🎥 ADD YOUR VIDEO → /public/videos/reverse-grip-curls.mp4
  },

  // ===== CORE =====
  // 🎥 ADD YOUR VIDEOS: Place mp4 files in /public/videos/ named by slug.
  CORE: {
    PLANK: 'Plank',              // 🎥 ADD YOUR VIDEO → /public/videos/plank.mp4
    CRUNCHES: 'Crunches',           // 🎥 ADD YOUR VIDEO → /public/videos/crunches.mp4
    LEG_RAISES: 'Leg Raises',         // 🎥 ADD YOUR VIDEO → /public/videos/leg-raises.mp4
    RUSSIAN_TWISTS: 'Russian Twists',     // 🎥 ADD YOUR VIDEO → /public/videos/russian-twists.mp4
    BICYCLE_CRUNCHES: 'Bicycle Crunches',   // 🎥 ADD YOUR VIDEO → /public/videos/bicycle-crunches.mp4
    HANGING_LEG_RAISES: 'Hanging Leg Raises', // 🎥 ADD YOUR VIDEO → /public/videos/hanging-leg-raises.mp4
    AB_WHEEL_ROLLOUT: 'Ab Wheel Rollout',   // 🎥 ADD YOUR VIDEO → /public/videos/ab-wheel-rollout.mp4
    DRAGON_FLAGS: 'Dragon Flags',       // 🎥 ADD YOUR VIDEO → /public/videos/dragon-flags.mp4
  },

  // ===== FULL BODY =====
  // 🎥 ADD YOUR VIDEOS: Place mp4 files in /public/videos/ named by slug.
  FULL_BODY: {
    BENT_OVER_ROW: 'Bent Over Row',      // 🎥 ADD YOUR VIDEO → /public/videos/bent-over-row.mp4
    OVERHEAD_PRESS: 'Overhead Press',     // 🎥 ADD YOUR VIDEO → /public/videos/overhead-press.mp4
    LUNGES: 'Lunges',             // 🎥 ADD YOUR VIDEO → /public/videos/lunges.mp4
  },
} as const;

// ==============================================================================
// 🎬 SLUG-BASED VIDEO LOOKUP
// ==============================================================================

/** Convert any exercise name → slug, e.g. "Barbell Back Squat" → "barbell-back-squat" */
const toSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/**
 * Override map for exercises whose video filename differs from the auto-generated slug.
 * Key = exact exercise display name, Value = actual filename (without .mp4).
 */
const SLUG_OVERRIDES: Record<string, string> = {
  'Decline Push-ups': 'decline-push-up',
  'Dumbbell Pullover': 'dumbell-pullover',
  'Leg Extensions': 'leg-extension',
  'Pec Deck Machine': 'pec-deck',
  'Incline Dumbbell Press': 'incline-bench-press',   // file content is dumbbell press
  'Incline Bench Press': 'incline-benchpress',     // file without hyphen has bench press
  'Pull-ups': 'pull-ups-weighted',            // video file kept original name
};

/**
 * Return the video path for an exercise.
 * Checks SLUG_OVERRIDES first, then falls back to auto-generated slug.
 * If a video doesn't exist the browser's <video onError> should fallback to /videos/default.mp4.
 */
export const getVideoUrl = (name: string): string => {
  const slug = SLUG_OVERRIDES[name] || toSlug(name);
  return `/videos/${slug}.mp4`;
};

// ==============================================================================
// 🏗️ EXERCISE FACTORY
// ==============================================================================

const createExercise = (name: string, sets: number, reps: string, muscle: string, equipment: string): Exercise => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  sets,
  reps,
  muscleGroup: muscle,
  equipment,
  completed: false,
  videoUrl: getVideoUrl(name)
});

// ==============================================================================
// 💪 TARGETED WORKOUT GENERATOR (GYM ONLY)
// ==============================================================================

/**
 * Generates a targeted gym workout based on Body Part and Level.
 * All exercise names reference the EX constant for compile-time safety.
 */
export const generateTargetedWorkout = (target: BodyPart, level: FitnessLevel): WorkoutDay => {
  let exercises: Exercise[] = [];

  // --- CHEST ---
  if (target === BodyPart.CHEST) {
    exercises = [
      createExercise(EX.CHEST.BARBELL_BENCH_PRESS, level === 'Advanced' ? 5 : 4, level === 'Advanced' ? '5-8' : '8-12', 'Chest', 'Barbell'),
      createExercise(EX.CHEST.INCLINE_DUMBBELL_PRESS, 4, '10-12', 'Upper Chest', 'Dumbbells'),
      createExercise(EX.CHEST.INCLINE_BENCH_PRESS, 3, '12-15', 'Inner Chest', 'Cable'),
      createExercise(EX.CHEST.CHEST_DIPS_WEIGHTED, 3, 'Failure', 'Lower Chest', 'Dip Station'),
    ];
    if (level !== 'Beginner') {
      exercises.push(createExercise(EX.CHEST.PEC_DECK_MACHINE, 3, '15', 'Chest', 'Machine'));
    }
    if (level === 'Advanced') {
      exercises.push(createExercise(EX.CHEST.DECLINE_PUSH_UPS, 3, 'Failure', 'Chest', 'Bodyweight'));
      exercises.push(createExercise(EX.CHEST.DUMBBELL_PULLOVER, 3, '12', 'Serratus/Chest', 'Dumbbell'));
    }
  }

  // --- BACK ---
  else if (target === BodyPart.BACK) {
    exercises = [
      createExercise(EX.BACK.DEADLIFT, level === 'Advanced' ? 5 : 3, '5-8', 'Whole Back', 'Barbell'),
      createExercise(EX.BACK.LAT_PULLDOWN, 4, '10-12', 'Lats', 'Cable'),
      createExercise(EX.BACK.SEATED_CABLE_ROW, 4, '10-12', 'Mid Back', 'Cable'),
      createExercise(EX.BACK.SINGLE_ARM_DUMBBELL_ROW, 3, '12 each', 'Lats', 'Dumbbell'),
    ];
    if (level !== 'Beginner') {
      exercises.push(createExercise(EX.BACK.FACE_PULLS, 4, '15', 'Rear Delt/Rotator', 'Cable'));
    }
    if (level === 'Advanced') {
      exercises.push(createExercise(EX.BACK.PULL_UPS_WEIGHTED, 4, 'Failure', 'Lats', 'Bar'));
      exercises.push(createExercise(EX.BACK.STRAIGHT_ARM_PULLDOWN, 3, '15', 'Lats', 'Cable'));
    }
  }

  // --- LEGS ---
  else if (target === BodyPart.LEGS) {
    exercises = [
      createExercise(EX.LEGS.BARBELL_BACK_SQUAT, level === 'Advanced' ? 5 : 4, '6-10', 'Quads/Glutes', 'Barbell'),
      createExercise(EX.LEGS.ROMANIAN_DEADLIFT, 4, '10', 'Hamstrings', 'Barbell'),
      createExercise(EX.LEGS.LEG_PRESS, 3, '12-15', 'Legs', 'Machine'),
      createExercise(EX.LEGS.WALKING_LUNGES, 3, '12 steps each', 'Legs', 'Dumbbells'),
    ];
    if (level !== 'Beginner') {
      exercises.push(createExercise(EX.LEGS.LEG_EXTENSIONS, 3, '15', 'Quads', 'Machine'));
      exercises.push(createExercise(EX.LEGS.HAMSTRING_CURL, 3, '15', 'Hamstrings', 'Machine'));
    }
    if (level === 'Advanced') {
      exercises.push(createExercise(EX.LEGS.STANDING_CALF_RAISE, 5, '15-20', 'Calves', 'Machine'));
      exercises.push(createExercise(EX.LEGS.BULGARIAN_SPLIT_SQUAT, 3, '10 each', 'Glutes', 'Dumbbells'));
    }
  }

  // --- SHOULDERS ---
  else if (target === BodyPart.SHOULDERS) {
    exercises = [
      createExercise(EX.SHOULDERS.OVERHEAD_BARBELL_PRESS, 4, '8-10', 'Front Delt', 'Barbell'),
      createExercise(EX.SHOULDERS.DUMBBELL_LATERAL_RAISES, 4, '15', 'Side Delt', 'Dumbbells'),
      createExercise(EX.SHOULDERS.DUMBBELL_FRONT_RAISES, 3, '12', 'Front Delt', 'Dumbbells'),
    ];
    if (level !== 'Beginner') {
      exercises.push(createExercise(EX.SHOULDERS.REAR_DELT_FLYS, 3, '15', 'Rear Delt', 'Dumbbells/Machine'));
      exercises.push(createExercise(EX.SHOULDERS.ARNOLD_PRESS, 3, '10-12', 'Shoulders', 'Dumbbells'));
    }
    if (level === 'Advanced') {
      exercises.push(createExercise(EX.SHOULDERS.UPRIGHT_ROWS, 3, '12', 'Traps', 'Barbell'));
      exercises.push(createExercise(EX.SHOULDERS.CABLE_LATERAL_RAISES, 4, '12 each', 'Side Delt', 'Cable'));
      exercises.push(createExercise(EX.SHOULDERS.SHRUGS, 4, '20', 'Traps', 'Dumbbells'));
    }
  }

  // --- ARMS ---
  else if (target === BodyPart.ARMS) {
    exercises = [
      createExercise(EX.ARMS.BARBELL_BICEP_CURL, 4, '10-12', 'Biceps', 'Barbell'),
      createExercise(EX.ARMS.TRICEP_ROPE_PUSHDOWN, 4, '12-15', 'Triceps', 'Cable'),
      createExercise(EX.ARMS.HAMMER_CURLS, 3, '12', 'Brachialis', 'Dumbbells'),
      createExercise(EX.ARMS.SKULLCRUSHERS, 3, '10-12', 'Triceps', 'EZ Bar'),
    ];
    if (level !== 'Beginner') {
      exercises.push(createExercise(EX.ARMS.PREACHER_CURLS, 3, '12', 'Biceps', 'Machine/Bench'));
      exercises.push(createExercise(EX.ARMS.OVERHEAD_TRICEP_EXTENSION, 3, '12', 'Triceps', 'Dumbbell'));
    }
    if (level === 'Advanced') {
      exercises.push(createExercise(EX.ARMS.CONCENTRATION_CURLS, 3, '15 each', 'Biceps Peak', 'Dumbbell'));
      exercises.push(createExercise(EX.ARMS.TRICEP_DIPS_WEIGHTED, 3, 'Failure', 'Triceps', 'Bars'));
      exercises.push(createExercise(EX.ARMS.REVERSE_GRIP_CURLS, 3, '15', 'Forearms', 'Barbell'));
    }
  }

  // --- CORE ---
  else if (target === BodyPart.CORE) {
    exercises = [
      createExercise(EX.CORE.PLANK, 3, '45-60 sec', 'Stability', 'Floor'),
      createExercise(EX.CORE.CRUNCHES, 3, '20', 'Upper Abs', 'Floor'),
      createExercise(EX.CORE.LEG_RAISES, 3, '15', 'Lower Abs', 'Floor'),
    ];
    if (level !== 'Beginner') {
      exercises.push(createExercise(EX.CORE.RUSSIAN_TWISTS, 3, '30', 'Obliques', 'Weight/Floor'));
      exercises.push(createExercise(EX.CORE.BICYCLE_CRUNCHES, 3, '30', 'Abs', 'Floor'));
    }
    if (level === 'Advanced') {
      exercises.push(createExercise(EX.CORE.HANGING_LEG_RAISES, 4, '12', 'Lower Abs', 'Bar'));
      exercises.push(createExercise(EX.CORE.AB_WHEEL_ROLLOUT, 3, '10-15', 'Core', 'Wheel'));
      exercises.push(createExercise(EX.CORE.DRAGON_FLAGS, 3, 'Failure', 'Core', 'Bench/Floor'));
    }
  }

  // --- FULL BODY / DEFAULT ---
  else {
    exercises = [
      createExercise(EX.LEGS.BARBELL_BACK_SQUAT, 4, '10', 'Legs', 'Barbell'),
      createExercise(EX.CHEST.BARBELL_BENCH_PRESS, 4, '10', 'Chest', 'Barbell'),
      createExercise(EX.FULL_BODY.BENT_OVER_ROW, 4, '10', 'Back', 'Barbell'),
      createExercise(EX.FULL_BODY.OVERHEAD_PRESS, 3, '10', 'Shoulders', 'Barbell'),
    ];
    if (level !== 'Beginner') {
      exercises.push(createExercise(EX.BACK.DEADLIFT, 3, '8', 'Posterior Chain', 'Barbell'));
      exercises.push(createExercise(EX.BACK.PULL_UPS_WEIGHTED, 3, 'Failure', 'Back', 'Bar'));
    }
    if (level === 'Advanced') {
      exercises.push(createExercise(EX.FULL_BODY.LUNGES, 3, '12 each', 'Legs', 'Dumbbells'));
      exercises.push(createExercise(EX.CHEST.CHEST_DIPS_WEIGHTED, 3, 'Failure', 'Arms', 'Bars'));
      exercises.push(createExercise(EX.BACK.FACE_PULLS, 3, '15', 'Shoulders', 'Cable'));
    }
  }

  return {
    day: `${target} Focus (${level})`,
    exercises,
    completed: false,
    date: new Date().toLocaleDateString('en-CA')
  };
};

/**
 * MOCK LOGIC: Generates a default workout plan based on rules (fallback).
 */
export const generateMockWorkoutPlan = (profile: UserProfile): WorkoutDay[] => {
  // Return EMPTY array so Dashboard triggers selection mode
  return [];
};

// --- MEAL DATABASE ---
const MEAL_DB = {
  breakfast: [
    { name: 'Oatmeal with Berries', items: ['Oats', 'Blueberries', 'Honey', 'Almonds'], imgId: 1084 },
    { name: 'Avocado Toast & Eggs', items: ['Whole Wheat Bread', 'Avocado', '2 Eggs', 'Chili Flakes'], imgId: 835 },
    { name: 'Greek Yogurt Parfait', items: ['Greek Yogurt', 'Granola', 'Strawberries', 'Chia Seeds'], imgId: 429 },
    { name: 'Protein Pancakes', items: ['Protein Powder', 'Banana', 'Egg Whites', 'Syrup'], imgId: 292 },
    { name: 'Veggie Omelet', items: ['3 Eggs', 'Spinach', 'Mushrooms', 'Cheese'], imgId: 764 }
  ],
  lunch: [
    { name: 'Grilled Chicken Salad', items: ['Chicken Breast', 'Mixed Greens', 'Olive Oil', 'Tomatoes'], imgId: 1080 },
    { name: 'Quinoa Power Bowl', items: ['Quinoa', 'Chickpeas', 'Cucumber', 'Feta Cheese'], imgId: 493 },
    { name: 'Turkey Wrap', items: ['Whole Wheat Wrap', 'Turkey Slices', 'Lettuce', 'Mustard'], imgId: 25 },
    { name: 'Tuna Salad', items: ['Tuna', 'Celery', 'Mayo', 'Lettuce'], imgId: 692 },
    { name: 'Salmon Poke Bowl', items: ['Rice', 'Salmon', 'Edamame', 'Seaweed'], imgId: 22 }
  ],
  dinner: [
    { name: 'Baked Salmon & Asparagus', items: ['Salmon Fillet', 'Asparagus', 'Lemon', 'Garlic'], imgId: 420 },
    { name: 'Steak & Sweet Potato', items: ['Lean Steak', 'Sweet Potato', 'Green Beans'], imgId: 106 },
    { name: 'Tofu Stir-Fry', items: ['Tofu', 'Broccoli', 'Bell Peppers', 'Soy Sauce'], imgId: 292 },
    { name: 'Chicken Burrito Bowl', items: ['Chicken', 'Black Beans', 'Rice', 'Salsa'], imgId: 727 },
    { name: 'Zucchini Noodles', items: ['Zucchini', 'Marinara Sauce', 'Turkey Meatballs'], imgId: 526 }
  ],
  snack: [
    { name: 'Apple & Peanut Butter', items: ['Apple', 'Peanut Butter'], imgId: 102 },
    { name: 'Protein Shake', items: ['Whey Protein', 'Water/Milk'], imgId: 902 },
    { name: 'Almonds & Dark Chocolate', items: ['Almonds', 'Dark Chocolate Square'], imgId: 822 },
    { name: 'Cottage Cheese', items: ['Cottage Cheese', 'Pineapple'], imgId: 1060 },
    { name: 'Rice Cakes', items: ['Rice Cakes', 'Hummus'], imgId: 674 }
  ]
};

const getRandomMeal = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
  const options = MEAL_DB[type];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generates a randomized daily meal plan fitting calorie goals.
 */
export const generateDailyMealPlan = (profile: UserProfile): MealPlan => {
  // Rough estimate: BMR * 1.55 (Moderate activity default)
  let maintenance = profile.weight * 30; // rough rule of thumb
  let targetCals = maintenance;

  if (profile.goal === 'Muscle Gain' as unknown as Goal) targetCals += 300;

  const createMeal = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack', calPct: number): Meal => {
    const template = getRandomMeal(type);
    const cals = Math.floor(targetCals * calPct);
    return {
      name: template.name,
      calories: cals,
      protein: Math.floor((cals * 0.3) / 4), // 30% Protein
      carbs: Math.floor((cals * 0.4) / 4),   // 40% Carbs
      fats: Math.floor((cals * 0.3) / 9),    // 30% Fats
      items: template.items,
      image: `https://picsum.photos/id/${template.imgId}/300/200`
    };
  };

  return {
    totalCalories: Math.floor(targetCals),
    breakfast: createMeal('breakfast', 0.25),
    lunch: createMeal('lunch', 0.35),
    dinner: createMeal('dinner', 0.25),
    snack: createMeal('snack', 0.15),
  };
}

/**
 * GEMINI AI CHAT RESPONSE
 * Uses Gemini Flash 2.5 for fast, accurate fitness advice.
 */
export const getAiChatResponse = async (currentMessage: string, history: ChatMessage[]): Promise<string> => {
  try {
    if (!ai) return "AI Service not initialized. Please check your API Key.";

    // Map existing history to Gemini SDK format
    const historyForGemini = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are FitGenie, an elite AI fitness coach designed to help users achieve their physical goals. " +
          "You provide personalized workout plans, nutritional advice, form correction tips, and motivation. " +
          "When a user asks for a workout (e.g., 'leg day'), provide a structured list of exercises with sets and reps. " +
          "When asked about diet, provide specific meal examples with macros. " +
          "Keep your tone energetic, professional, and encouraging. " +
          "If a user asks a medical question, disclaim that you are an AI and suggest seeing a professional.",
      },
      history: historyForGemini
    });

    const result = await chat.sendMessage({ message: currentMessage });
    return result.text || "I'm having trouble thinking of a response right now. Try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently offline or having trouble connecting to the server. Please check your internet or API Key.";
  }
};
