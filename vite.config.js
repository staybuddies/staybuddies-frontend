import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE || "http://localhost:8080";
  const hmrHost = env.VITE_HMR_HOST || undefined; // e.g. 192.168.1.50

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
      host: true,          // allow LAN devices (iPad) to open Vite
      port: 5173,
      strictPort: true,
      cors: true,
      hmr: {
        protocol: "ws",
        host: hmrHost,     // set to your LAN IP via VITE_HMR_HOST for iPad
        port: 5173,
      },
      proxy: {
        // HTTP-only proxies; STOMP/SockJS should NOT go through Vite
        "/api": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        "/files": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        // IMPORTANT: do NOT proxy '/ws' — SockJS connects directly to backend
      },
    },

    // If you use `vite preview`
    preview: {
      host: true,
      port: 4173,
      strictPort: true,
      proxy: {
        "/api":    { target: apiBase, changeOrigin: true, secure: false },
        "/uploads":{ target: apiBase, changeOrigin: true, secure: false },
        "/files":  { target: apiBase, changeOrigin: true, secure: false },
        // no '/ws' here either
      },
    },
  };
});
