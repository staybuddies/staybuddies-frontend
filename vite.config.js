// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      buffer: 'buffer' // polyfill
    }
  },
  define: {
    global: 'window',   // some libs expect global
    'process.env': {}   // silence process.env usage
  },
  optimizeDeps: {
    include: ['@stomp/stompjs', 'sockjs-client/dist/sockjs.min.js']
  }
})
