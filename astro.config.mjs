// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';


// https://astro.build/config
export default defineConfig({
  site: 'https://typpy.online',
  integrations: [svelte(), mdx(), react()],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },

    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          ws: true
        }
      }
    },

    // Tailwind is loaded via PostCSS (`postcss.config.cjs`) instead of the Vite plugin.
  }
});