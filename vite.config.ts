import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Varje sektion har sina sidskal i en egen katalog vars namn är sektionens
// sökväg i webbadressen. Skalen samlas in automatiskt så att en ny sida bara
// behöver läggas till som fil.
function sectionPages(section: string) {
  return Object.fromEntries(
    readdirSync(resolve(__dirname, section))
      .filter((file) => file.endsWith('.html'))
      .map((file) => [
        `${section}/${file.replace(/\.html$/, '')}`,
        resolve(__dirname, section, file),
      ]),
  );
}

// Relativ bas gör att bygget fungerar både på GitHub Pages
// (underkatalog) och i containern (rot).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        ...sectionPages('arkitektur'),
        ...sectionPages('tjanster'),
        ...sectionPages('api'),
      },
    },
  },
});
