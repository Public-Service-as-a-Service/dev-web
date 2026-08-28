import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Relativ bas gör att bygget fungerar både på GitHub Pages
// (underkatalog) och i containern (rot).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        ekosystemet: resolve(__dirname, 'ekosystemet.html'),
      },
    },
  },
});
