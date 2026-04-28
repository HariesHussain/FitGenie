# FitGenie Agent Notes

## Project Overview

FitGenie is a Vite + React + TypeScript fitness app. It uses Firebase Auth/Firestore for signed-in users, localStorage fallbacks for guests, Google Gemini via `@google/genai`, lucide icons, and Recharts. The main app state and routing live in `App.tsx`; feature screens are in `views/`, shared UI is in `components/`, and data/API helpers are in `services/`.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`
- Check dependency advisories: `npm audit --audit-level=moderate`

On Windows PowerShell, `npm` may be blocked by script execution policy. Use `npm.cmd run build` or `npm.cmd run dev` when that happens.

## Environment

The app reads Vite environment variables from `.env.local`. Do not commit secrets. Relevant variables include:

- `VITE_GEMINI_API_KEY` / `VITE_GOOGLE_API_KEY` for Gemini
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_APPCHECK_SITE_KEY` for optional Firebase App Check / reCAPTCHA v3

`vite.config.ts` maps `VITE_GEMINI_API_KEY` into `process.env.API_KEY` and `process.env.GEMINI_API_KEY` for legacy code paths. `services/aiService.ts` also checks `import.meta.env.VITE_GOOGLE_API_KEY`.

The Gemini key is still visible in the browser bundle if configured with Vite variables. For a production billing-safe app, move Gemini calls behind Firebase Functions or another backend proxy with authentication, rate limits, and abuse monitoring.

## Code Style And Patterns

- Use React function components and hooks.
- Keep TypeScript types in `types.ts` and reuse the existing enums/interfaces.
- Prefer the existing shared components in `components/` before adding new UI primitives.
- Styling uses Tailwind compiled through Vite/PostCSS. Config lives in `tailwind.config.cjs`, PostCSS in `postcss.config.cjs`, and global CSS in `index.css`.
- The current visual language is light, professional, and restrained, with `bg-surface`, `text-primary`, `text-secondary`, slate borders, and compact rounded cards/buttons.
- Firebase access should stay behind helpers in `services/api.ts` when possible.
- Guest/local behavior matters: preserve localStorage fallbacks alongside Firebase paths.
- Workout video paths are generated in `services/aiService.ts` with slug helpers and overrides. New exercise names should be checked against `public/videos/`.

## Verification Notes

`npm.cmd run build` succeeds after the production-hardening and performance pass. `npm audit --audit-level=moderate` reports zero vulnerabilities.

- The first-load app chunk is small after route splitting. The largest remaining chunk is lazy-loaded third-party AI code.

The chunk-size warning is not a build failure.

## Security Files

- `firestore.rules` locks user documents and logs to the authenticated owner.
- `SECURITY.md` tracks the current security posture and remaining production requirements.
- `firebase.json` includes hosting headers and CSP.
