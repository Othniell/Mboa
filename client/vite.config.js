import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server:  {
    port: 3000,
    host: true, // allows access over local network
  },
  build: {
  outDir: 'dist',
  assetsDir: 'assets',
  emptyOutDir: true,
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    onwarn(warning, warn) {
      console.warn("⚠️ Build Warning:", warning.message);
      if (warning.code === 'CSS_SYNTAX_ERROR') {
        console.log('❌ Possibly bad CSS chunk:', warning);
      }
      warn(warning);
    },
  },
},

  resolve: {
    alias:  {
      '@': '/src',
      '@components': '/src/Components',
      '@assets': '/src/assets',
      '@pages': '/src/pages',
      '@context': '/src/context',
      '@utils': '/src/utils',
    }
  }
});
