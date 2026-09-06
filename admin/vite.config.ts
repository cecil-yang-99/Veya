import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Veya admin console.
// The dev server proxies API calls and uploaded files to the Nest backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
