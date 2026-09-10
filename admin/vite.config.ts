import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendProxyTarget =
  process.env.VITE_BACKEND_PROXY_TARGET ?? 'http://localhost:3000';

// Vite configuration for the Veya admin console.
// The dev server proxies API calls and uploaded files to the Nest backend.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: backendProxyTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
