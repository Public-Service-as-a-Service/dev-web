import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Alla sidor under tjanster/ är egna ingångar: sidskalen genereras av
// scripts/generate-pages.py och renderas av React-ingångarna i src/entries/.
const servicePages = Object.fromEntries(
  readdirSync(resolve(__dirname, 'tjanster'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => [`tjanster/${f.replace(/\.html$/, '')}`, resolve(__dirname, 'tjanster', f)]),
);

// Relativ bas gör att bygget fungerar både på GitHub Pages
// (underkatalog) och i containern (rot).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // Bundlarna läggs i static/ så att webbplatsens egna assets/ kan kopieras
    // orörd till dist/assets av byggskriptet.
    assetsDir: 'static',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        ...servicePages,
      },
    },
  },
});
