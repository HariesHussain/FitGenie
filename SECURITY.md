# Security Notes

## Implemented

- Firestore rules restrict `users/{uid}`, `users/{uid}/exercise_logs`, and `user_data/{uid}` to the authenticated owner.
- Firestore rules restrict `ai_quotas/{subject}__${day}` to server-side writes only via API functions.
- Firebase Hosting sets security headers, including strict CSP (no unsafe-inline in script-src), frame denial, content sniffing protection, referrer policy, and restricted browser permissions.
- Firebase App Check is wired as an optional production control. Set `VITE_FIREBASE_APPCHECK_SITE_KEY` to enable reCAPTCHA v3 App Check token enforcement.
- Client-side OTP generation was removed because it is not a trusted verification mechanism.
- EmailJS was removed from the dependency graph.
- Debug console output for Firebase and EmailJS was removed.
- Tailwind now builds locally through Vite instead of loading a runtime CDN script.
- Gemini API calls are routed through `/api/chat` endpoint with server-side key injection (not visible in client bundle).
- CORS is restricted: wildcard fallback removed; `APP_ORIGIN` must be explicitly set in environment variables.
- Daily quota tracking moved from in-memory to Firestore (persistent, survives restarts, secure).
- Per-minute rate limiting remains in-memory (acceptable for DDoS mitigation; resets on restart).

## Production Requirements

1. **Set `APP_ORIGIN` Environment Variable**: 
   - Production domain(s) that are allowed to call `/api/chat`.
   - Example: `https://fitgenie-x.vercel.app`
   - Requests from other origins will be rejected (CORS).

2. **Gemini API Key**:
   - Must be set as `GEMINI_API_KEY` environment variable on Vercel/functions deployment.
   - Never commit to client-side code or `.env.local` in production.
   - The `/api/chat` endpoint uses this server-side key; client never sees it.

3. **Firebase Admin Credentials**:
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` required for server-side quota tracking.
   - Set as secret environment variables on deployment platform.

4. **Firebase App Check (Recommended)**:
   - Enable `VITE_FIREBASE_APPCHECK_SITE_KEY` to activate client attestation.
   - Provides additional bot/abuse protection via reCAPTCHA v3.

## Known Transitive Vulnerabilities

- `uuid`, `@tootallnate/once` vulnerabilities in Google Cloud SDK dependencies (not directly used in app logic).
  - These are transitive dependencies of firebase-admin and only loaded on the backend during quota checks.
  - Client bundle does not include these packages.
  - Firestore reads/writes are the primary attack surface; server-side quota enforcement mitigates abuse.
  - Monitor firebase-admin releases for updates.

## CSP Hardening

- Removed `'unsafe-inline'` from script-src policy.
- React build outputs inline CSS, but Tailwind is now compiled at build time (no runtime script-src violation).
- Fonts, images, and media are whitelisted by trusted CDNs.
- Frame-src limited to YouTube and self.
- Base-uri and manifest-src restricted to self.

## To Deploy to Production

1. Set environment variables on Vercel (or your hosting platform):
   ```
   APP_ORIGIN=https://your-production-domain.com
   GEMINI_API_KEY=<your-gemini-key>
   FIREBASE_PROJECT_ID=<your-firebase-project>
   FIREBASE_CLIENT_EMAIL=<firebase-service-account-email>
   FIREBASE_PRIVATE_KEY=<firebase-service-account-key>
   VITE_FIREBASE_API_KEY=<your-firebase-web-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
   VITE_FIREBASE_PROJECT_ID=<your-firebase-project>
   VITE_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-sender-id>
   VITE_FIREBASE_APP_ID=<your-firebase-app-id>
   VITE_FIREBASE_APPCHECK_SITE_KEY=<your-recaptcha-v3-site-key>
   ```

2. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

3. Verify:
   - No `VITE_GEMINI_API_KEY` or `VITE_GOOGLE_API_KEY` in browser bundles.
   - Security headers present (check browser DevTools or curl).
   - Daily quota respected: authenticated users get 7 requests/day, guests get 3.
   - CORS rejects unauthorized origins.
