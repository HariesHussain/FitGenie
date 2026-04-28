# FitGenie

FitGenie is a Vite + React + TypeScript fitness app with Firebase Auth/Firestore, workout and nutrition planning, progress tracking, and AI coaching.

The AI layer is production-safe: Gemini is called only from a server-side API route (`/api/chat`) and never directly from the browser.

## Features

- Personalized workout generation by body part and fitness level
- Daily meal plan generation with macro targets
- Exercise tracker and progress history
- AI fitness coach chat
- Firebase authentication + guest mode
- Responsive UI for mobile and desktop

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
```

Never put Gemini or private secrets in any `VITE_*` variable.

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
