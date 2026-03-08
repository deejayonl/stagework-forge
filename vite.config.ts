import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:18790',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://localhost:18790',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:18790',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows'
      ? 'chrome105'
      : process.env.TAURI_ENV_PLATFORM === 'linux'
        ? 'chrome105'
        : 'safari14',
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
