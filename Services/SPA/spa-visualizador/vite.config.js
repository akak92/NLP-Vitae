import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/file': {
        target: 'http://api:8888',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});