import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // No proxy needed since we're not connecting to a backend
    port: 3000,
    host: true, // Makes the server accessible on your local network
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      // Optional: Set up path aliases for your frontend-only project
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets'
    }
  }
});