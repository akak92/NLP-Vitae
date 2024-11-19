import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/file': {
        target: 'http://api:8888', // Endpoint para /file
        changeOrigin: true,
        secure: false,
      },
      '/tversion': {
        target: 'http://ocr:9000', // Endpoint para /tversion
        changeOrigin: true,
        secure: false,
      },
      '/model': {
        target: 'http://ner:9001', // Endpoint para /model
        changeOrigin: true,
        secure: false,
      },
    },
  },
});