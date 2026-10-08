import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        '**/truck-parts-admin/**',
        '**/truck-parts-api/**',
        '**/*.pdf',
        '**/*.backup',
        '**/.git/**',
      ],
    },
  },
  build: {
    sourcemap: false,
  },
})
