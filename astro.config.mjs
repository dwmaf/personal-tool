// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";
import vue from "@astrojs/vue";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [vue(), svelte({ include: ['src/components/**/*.svelte'] })],
  vite: {
    plugins: [tailwindcss()],
  },
});