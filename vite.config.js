import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const target = env.VITE_API_BASE || "http://localhost:8080";
  const proxy = Object.fromEntries(["/api", "/uploads", "/files", "/ws"].map(prefix => [prefix, {
    target, changeOrigin: true, ...(prefix === "/ws" ? { ws: true } : {}),
  }]));
  return {
    plugins: [vue()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)), buffer: "buffer" } },
    define: { global: "window", "process.env": {} },
    optimizeDeps: { include: ["@stomp/stompjs", "sockjs-client"] },
    server: {
      host: "127.0.0.1", port: 5173, strictPort: true, proxy,
      ...(env.VITE_HMR_HOST ? { hmr: { host: env.VITE_HMR_HOST } } : {}),
    },
    preview: { host: "127.0.0.1", port: 4173, strictPort: true, proxy },
  };
});
