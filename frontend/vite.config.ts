import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/api/directions': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/api/geocoding': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/api/health': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/img': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
