// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE || "http://localhost:8080";
  const hmrHost = env.VITE_HMR_HOST || undefined;

  return {
    plugins: [vue()],
    
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        buffer: "buffer",
      },
    },
    
    define: {
      global: "window",
      "process.env": {},
    },
    
    optimizeDeps: {
      include: ["@stomp/stompjs", "sockjs-client"],
    },
    
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      cors: true,
      hmr: { 
        protocol: "ws", 
        host: hmrHost, 
        port: 5173 
      },
      proxy: {
        "/api": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        "/uploads": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/files": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        
        // ✅ WebSocket proxy - CRITICAL FIX
        "/ws": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
          ws: true, // Enable WebSocket proxying
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('WebSocket proxy error', err);
            });
            proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
              console.log('WebSocket proxy request:', req.url);
            });
          },
        },
        
        // Admin SPA/session endpoints
        "/admins": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/login": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/logout": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/register": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
      },
    },
    
    preview: {
      host: true,
      port: 4173,
      strictPort: true,
      proxy: {
        "/api": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/uploads": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/files": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/ws": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "/admins": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/login": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/logout": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
        "/register": { 
          target: apiBase, 
          changeOrigin: true, 
          secure: false 
        },
      },
    },
  };
});