import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { GoogleGenAI } from "@google/genai";

initializeApp();

const db = getFirestore();
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const MODEL = "gemini-2.5-flash";
const HISTORY_LIMIT = 12;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_MESSAGE_LENGTH = 1200;

const AUTH_LIMIT_PER_MINUTE = 30;
const UNAUTH_LIMIT_PER_MINUTE = 10;

const SYSTEM_INSTRUCTION =
  "You are FitGenie, an elite AI fitness coach designed to help users achieve their physical goals. " +
  "You provide personalized workout plans, nutritional advice, form correction tips, and motivation. " +
  "When a user asks for a workout (e.g., leg day), provide a structured list of exercises with sets and reps. " +
  "When asked about diet, provide specific meal examples with macros. " +
  "Keep your tone energetic, professional, and encouraging. " +
  "If a user asks a medical question, explain that you are not a medical professional and suggest seeing a qualified clinician.";

function sanitizeText(input, maxLength) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function validateAndNormalizeRequest(data) {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "Invalid payload.");
  }

  const message = sanitizeText(data.message, MAX_MESSAGE_LENGTH);
  if (!message) {
    throw new HttpsError("invalid-argument", "Message is required.");
  }

  const rawHistory = Array.isArray(data.history) ? data.history : [];
  const history = rawHistory.slice(-HISTORY_LIMIT).map((entry) => {
    const role = entry?.role === "user" ? "user" : "model";
    const text = sanitizeText(entry?.text ?? "", MAX_HISTORY_MESSAGE_LENGTH);
    return { role, parts: [{ text }] };
  }).filter((entry) => entry.parts[0].text.length > 0);

  return { message, history };
}

async function enforceRateLimit({ uid, ip }) {
  const now = Date.now();
  const minuteBucket = Math.floor(now / 60000);

  const subject = uid ? `uid:${uid}` : `ip:${ip || "unknown"}`;
  const limit = uid ? AUTH_LIMIT_PER_MINUTE : UNAUTH_LIMIT_PER_MINUTE;

  const rateRef = db.collection("_rate_limits").doc(`${subject}:${minuteBucket}`);

  await db.runTransaction(async (txn) => {
    const snap = await txn.get(rateRef);
    const count = snap.exists ? (snap.data()?.count ?? 0) : 0;

    if (count >= limit) {
      throw new HttpsError("resource-exhausted", "Rate limit exceeded. Please try again in a minute.");
    }

    if (!snap.exists) {
      txn.set(rateRef, {
        subject,
        bucket: minuteBucket,
        count: 1,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }

    txn.update(rateRef, {
      count: count + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export const chatWithCoach = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 20,
    memory: "256MiB",
    secrets: [GEMINI_API_KEY],
    enforceAppCheck: true,
  },
  async (request) => {
    const uid = request.auth?.uid ?? null;
    const ip = request.rawRequest.ip || request.rawRequest.headers["x-forwarded-for"] || "unknown";

    const { message, history } = validateAndNormalizeRequest(request.data);

    await enforceRateLimit({ uid, ip });

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
      const chat = ai.chats.create({
        model: MODEL,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history,
      });

      const response = await chat.sendMessage({ message });
      const reply = sanitizeText(response.text || "", 6000);

      if (!reply) {
        throw new HttpsError("internal", "Empty AI response.");
      }

      return { reply };
    } catch (error) {
      if (error instanceof HttpsError) throw error;

      logger.error("chatWithCoach failed", {
        uid,
        hasAppCheck: Boolean(request.app),
        error: error instanceof Error ? error.message : String(error),
      });

      throw new HttpsError("internal", "AI service is temporarily unavailable.");
    }
  }
);