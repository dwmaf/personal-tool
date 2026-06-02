// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  build: {
    transpile: ['@jsquash/avif'],
  },
  vite: {
    optimizeDeps: {
      exclude: ['@jsquash/avif'],
    },
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      title: 'Personal Toolkits', // Pastikan di sini sudah benar
      meta: [
        { name: 'description', content: 'My personal toolkits' }
      ],
    }
  },
})
