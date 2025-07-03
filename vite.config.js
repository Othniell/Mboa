import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/Mboa",
  server:  {
    port: 3000,
    host: true, // allows access over local network
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200, // raises limit from 500kB to avoid warning
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendors';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('react-icons')) return 'icons';
            if (id.includes('leaflet')) return 'leaflet';
          }

          if (id.includes('/src/pages/')) return 'pages';
          if (id.includes('/src/Components/')) return 'components';
          if (id.includes('/src/context/')) return 'context';
          if (id.includes('/src/utils/')) return 'utils';
        }
      }
    }
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
