import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Only load VITE_ prefixed env vars — never expose server-side secrets to the client bundle.
  // The empty-prefix loadEnv was pulling GEMINI_API_KEY from .env into the browser bundle.
  const env = loadEnv(mode, process.cwd());
  
  return {
    // DO NOT use define{} to inject server-side API keys into the client.
    // VITE_ prefixed variables are automatically available via import.meta.env.
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'apk-mime-type',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.split('?')[0].endsWith('.apk')) {
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="fitgenie-latest.apk"');
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
