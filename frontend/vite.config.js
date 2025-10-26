// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://cicd-production-6388.up.railway.app', // Adjust the port if necessary
    },
  },
});
