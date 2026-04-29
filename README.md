# FitGenie

FitGenie is a Vite + React + TypeScript fitness app with Firebase Auth/Firestore, workout and nutrition planning, progress tracking, and AI coaching.

The AI layer is production-safe: Gemini is called only from a server-side API route (`/api/chat`) and never directly from the browser.

## Features

- Personalized workout generation by body part and fitness level
- Daily meal plan generation with strict macro targets (calorie targets hidden for better mental focus)
- Exercise tracker and progress history
- AI fitness coach chat (Local fallback enabled)
- Offline-First Data Persistence (via Firestore IndexedDB)
- Firebase authentication + guest mode
- Responsive UI for mobile, desktop, and native APK wrapping

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Firebase Auth + Firestore
- Vercel Serverless API (`api/chat.js`)
- Google Gemini (`@google/genai`) on server side only
- Recharts

## Security Model

- No Gemini key in frontend bundle
- Server-side AI key via environment variable: `GEMINI_API_KEY`
- Rate limiting and quota enforcement in `/api/chat`
- Guest users: 3 AI messages/day
- Signed-in users: 7 AI requests/day
- Optional Firebase ID token verification in API route
- Firestore rules restrict user data to owner

## Project Structure

```text
api/              Serverless backend routes (Vercel)
components/       Shared UI components
views/            App screens
services/         App services and client helpers
public/videos/    Exercise demo videos
firestore.rules   Firestore access rules
firebase.json     Hosting/security headers config
```

## Environment Variables

### Frontend (`.env.local`)

Only public Firebase web config should be here:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_APPCHECK_SITE_KEY=...   # optional
VITE_ANDROID_APK_URL=https://your-domain.com/fitgenie-latest.apk   # direct APK download for Android Chrome
VITE_MOBILE_APP_URL=https://play.google.com/store/apps/details?id=com.yourcompany.fitgenie   # optional fallback for mobile Download App button
```

Never put Gemini or private secrets in any `VITE_*` variable.

## Mobile App Experience

FitGenie now supports mobile installation as a PWA:

- On mobile, a `Download App` button appears next to `Login` on the landing header.
- If the browser supports native PWA install prompts, the button opens that prompt.
- If install prompt is unavailable, the button falls back to `VITE_MOBILE_APP_URL` (for example Google Play listing).
- On laptop/desktop layouts, the `Download App` button is hidden.
- Guest mode is hidden on mobile to enforce authenticated usage.

## Mobile App Discovery (ASO + SEO)

- Keep website SEO tags and structured data for web ranking.
- For app discovery, publish Android/iOS listings and set `VITE_MOBILE_APP_URL` to your store URL.
- Use consistent app name, icon, screenshots, and keywords across Play Store/App Store metadata.

### Android Release APK (Removing "Risk Alert")
If you are side-loading the app directly via `.apk` and receive a "Risk Alert" from Play Protect, it is because you are installing a debug build. To fix this:
1. Generate a production keystore (already configured in `android/app/build.gradle`).
2. Run `cd android; ./gradlew assembleRelease` to build a signed release APK.
3. Distribute the resulting `app-release.apk` instead of `app-debug.apk`.

## Web + Mobile Shared Data

Data is shared between website and app installs as long as both use the same Firebase project:

- Same Firebase Auth project for sign-in
- Same Firestore project for user/workout/log data
- Same Firestore rules (already owner-scoped)

This gives account-level continuity across browser and mobile app, including synced profile/workout/chat history stored in Firestore.

### Server (Vercel Project Environment Variables)

Required:

```env
GEMINI_API_KEY=...
```

Recommended (for Firebase token verification in API route):

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...   # keep escaped newlines in env
APP_ORIGIN=https://your-domain.com
```

## Local Development

```bash
npm install
npm run dev
```

Windows PowerShell fallback:

```bash
npm.cmd run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deploy

### Vercel (recommended)

1. Push repository to GitHub
2. Import project in Vercel
3. Add required environment variables in Vercel settings
4. Deploy

Vercel will build frontend and serve `api/chat.js` as serverless backend.

### Firebase (Auth/Firestore rules)

Deploy rules when updated:

```bash
firebase deploy --only firestore:rules
```

## Production Checklist

- Confirm `.env` and `.env.local` are not committed
- Confirm `GEMINI_API_KEY` exists only in server env
- Revoke old leaked Gemini keys
- Verify `/api/chat` quotas and error responses in production
- Add only trusted domains in Firebase Auth settings

## License

MIT
