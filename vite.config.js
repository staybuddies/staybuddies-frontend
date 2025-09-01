// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE || 'http://localhost:8080'

  return {
    plugins: [vue()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        buffer: 'buffer', // light polyfill some libs expect
      },
    },

    define: {
      global: 'window',      // some libs expect a global
      'process.env': {},     // silence process.env reads
    },

    optimizeDeps: {
      include: ['@stomp/stompjs', 'sockjs-client/dist/sockjs.min.js'],
    },

    server: {
      host: true,
      port: 5173,
      cors: true,
      proxy: {
        // If your axios already targets 8080 directly you can remove this,
        // but leaving it is harmless and helps during local dev.
        '/api': {
          target: apiBase,
          changeOrigin: true,
          ws: true,
          secure: false,
        },
        // Static files served by Spring
        '/uploads': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        // Your local-file handler path (FileService -> "/files/{key}")
        '/files': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        // If you use SockJS/STOMP under /ws
        '/ws': {
          target: apiBase,
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    },

    // Also make them work in `vite preview`
    preview: {
      proxy: {
        '/api':    { target: apiBase, changeOrigin: true, ws: true, secure: false },
        '/uploads':{ target: apiBase, changeOrigin: true, secure: false },
        '/files':  { target: apiBase, changeOrigin: true, secure: false },
        '/ws':     { target: apiBase, changeOrigin: true, ws: true, secure: false },
      },
    },
  }
})
