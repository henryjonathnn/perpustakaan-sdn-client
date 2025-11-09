import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // Needed for docker
    port: 5173,
    watch: {
      usePolling: true // Needed for hot reload in Docker
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // No preprocessor injection — import globals.css explicitly in main.ts
})
