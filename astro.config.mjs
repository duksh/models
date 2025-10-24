// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
optimizeDeps: {
  exclude: ['@sqlite.org/sqlite-wasm'],
},
  },

  integrations: [react()]
});