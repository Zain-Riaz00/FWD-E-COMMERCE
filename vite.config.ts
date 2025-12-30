import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  publicDir: 'public',
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.match(/\breact(-dom)?\b|react-router-dom/)) return 'react'
            if (id.includes('framer-motion')) return 'motion'
            if (id.match(/\bthree\b|@react-three\/fiber|@react-three\/drei/)) return 'three'
            if (id.includes('gsap')) return 'gsap'
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
