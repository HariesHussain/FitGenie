import { GoogleGenAI } from "@google/genai";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const SYSTEM_INSTRUCTION =
  "You are FitGenie, an elite AI fitness coach designed to help users achieve their physical goals. " +
  "You provide personalized workout plans, nutritional advice, form correction tips, and motivation. " +
  "When a user asks for a workout (e.g., leg day), provide a structured list of exercises with sets and reps. " +
  "When asked about diet, provide specific meal examples with macros. " +
  "Keep your tone energetic, professional, and encouraging. " +
  "If a user asks a medical question, explain that you are not a medical professional and suggest seeing a qualified clinician.";

const HISTORY_LIMIT = 12;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_MESSAGE_LENGTH = 1200;
const AUTH_LIMIT_PER_MINUTE = 30;
const GUEST_LIMIT_PER_MINUTE = 10;
const AUTH_DAILY_QUOTA = 7;
const GUEST_DAILY_QUOTA = 3;

const rateMap = globalThis.__fitgenieRateMap || new Map();
globalThis.__fitgenieRateMap = rateMap;
const quotaMap = globalThis.__fitgenieQuotaMap || new Map();
globalThis.__fitgenieQuotaMap = quotaMap;

function sanitizeText(input, maxLen) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ").slice(0, maxLen);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0];
  if (typeof forwarded === "string" && forwarded.length > 0) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function applyRateLimit(subject, limit) {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${subject}:${minute}`;
  const current = rateMap.get(key) || 0;

  if (current >= limit) {
    return false;
  }

  rateMap.set(key, current + 1);

  if (rateMap.size > 2000) {
    for (const [k] of rateMap) {
      const [, bucket] = k.split(":");
      if (Number(bucket) < minute - 2) {
        rateMap.delete(k);
      }
    }
  }

  return true;
}

function getDayBucket(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function consumeDailyQuota(subject, quotaLimit) {
  const day = getDayBucket();
  const key = `${subject}:${day}`;
  const current = quotaMap.get(key) || 0;

  if (current >= quotaLimit) {
    return false;
  }

  quotaMap.set(key, current + 1);

  if (quotaMap.size > 4000) {
    for (const [k] of quotaMap) {
      const bucket = k.split(":").pop();
      if (bucket && bucket < getDayBucket(new Date(Date.now() - 2 * 86400000))) {
        quotaMap.delete(k);
      }
    }
  }

  return true;
}

function setCors(req, res) {
  const allowOrigin = process.env.APP_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}

function initAdminIfConfigured() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return false;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return true;
}

async function verifyUser(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { uid: null, trusted: false };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return { uid: null, trusted: false };
  }

  const adminReady = initAdminIfConfigured();
  if (!adminReady) {
    return { uid: null, trusted: false };
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    return { uid: decoded.uid, trusted: true };
  } catch {
    return { uid: null, trusted: false };
  }
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server AI key is not configured." });
  }

  const message = sanitizeText(req.body?.message, MAX_MESSAGE_LENGTH);
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
  const history = rawHistory
    .slice(-HISTORY_LIMIT)
    .map((entry) => {
      const role = entry?.role === "user" ? "user" : "model";
      const text = sanitizeText(entry?.text, MAX_HISTORY_MESSAGE_LENGTH);
      return { role, parts: [{ text }] };
    })
    .filter((entry) => entry.parts[0].text.length > 0);

  const ip = getClientIp(req);
  const verified = await verifyUser(req);
  const subject = verified.trusted && verified.uid ? `uid:${verified.uid}` : `ip:${ip}`;
  const limit = verified.trusted ? AUTH_LIMIT_PER_MINUTE : GUEST_LIMIT_PER_MINUTE;
  const dailyQuota = verified.trusted ? AUTH_DAILY_QUOTA : GUEST_DAILY_QUOTA;

  if (!applyRateLimit(subject, limit)) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again in one minute." });
  }

  if (!consumeDailyQuota(subject, dailyQuota)) {
    if (verified.trusted) {
      return res.status(403).json({ error: "Your quota is completed. You can send up to 7 AI requests per day." });
    }

    return res.status(403).json({ error: "Guest quota completed. You can send up to 3 AI messages. Please sign up to use more." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history,
    });

    const result = await chat.sendMessage({ message });
    const reply = sanitizeText(result.text || "", 6000);

    if (!reply) {
      return res.status(502).json({ error: "Empty AI response." });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("chat api error", {
      trusted: verified.trusted,
      uid: verified.uid,
      ip,
      message: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({ error: "AI service is temporarily unavailable." });
  }
}
