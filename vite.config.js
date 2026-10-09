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
  // Production builds call the API on their own origin (/api/v1, rewritten by vercel.json),
  // so `vite preview` needs the same hop to the local API.
  preview: {
    proxy: { '/api': 'http://localhost:5001' },
  },
  build: {
    sourcemap: false,
  },
})
