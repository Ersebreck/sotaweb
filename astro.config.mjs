// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ersebreck.github.io',
  base: 'sotaweb',
  vite: {
    plugins: [tailwindcss()]
  }
});