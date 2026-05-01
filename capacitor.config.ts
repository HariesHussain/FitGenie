import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitgenie.app',
  appName: 'FitGenie',
  webDir: 'dist',
  server: {
    // Use HTTPS scheme to avoid CORS and mixed-content blocks in Android WebView.
    // Without this, Capacitor defaults to http://localhost which causes fetch failures
    // to external HTTPS APIs like Gemini.
    androidScheme: 'https'
  }
};

export default config;
