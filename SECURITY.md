# Security Notes

## Implemented

- Firestore rules restrict `users/{uid}`, `users/{uid}/exercise_logs`, and `user_data/{uid}` to the authenticated owner.
- Firebase Hosting sets security headers, including CSP, frame denial, content sniffing protection, referrer policy, and restricted browser permissions.
- Firebase App Check is wired as an optional production control. Set `VITE_FIREBASE_APPCHECK_SITE_KEY` to enable reCAPTCHA v3 App Check token enforcement.
- Client-side OTP generation was removed because it is not a trusted verification mechanism.
- EmailJS was removed from the dependency graph.
- Debug console output for Firebase and EmailJS was removed.
- Tailwind now builds locally through Vite instead of loading a runtime CDN script.

## Production Requirement

Gemini calls must go through the server-side proxy (`functions/src/index.js`) where the `GEMINI_API_KEY` is loaded from Firebase Functions secrets. The frontend must not set `VITE_GEMINI_API_KEY` or `VITE_GOOGLE_API_KEY`.

Firebase web API keys are not private secrets, but the Firebase project must be protected with strong Firestore rules, authorized domains, App Check where possible, and billing alerts.
