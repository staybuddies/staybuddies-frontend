// src/api/index.js
import axios from "axios";

const DEV = import.meta.env.DEV;
// In dev we rely on Vite's proxy: requests go to /api/v1 → forwarded to VITE_API_BASE.
// In prod we hit the full API host.
const API_HOST = DEV ? "" : (import.meta.env.VITE_API_BASE || "");
const BASE = `${String(API_HOST).replace(/\/+$/, "")}/api/v1`;

// Read token from storage (accepts raw JWT or "Bearer <jwt>")
function readToken() {
  let t =
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  t = (t || "").trim();
  return t ? (t.startsWith("Bearer ") ? t.slice(7) : t) : null;
}

const api = axios.create({
  baseURL: BASE,          // dev: "/api/v1" (proxied) | prod: "<VITE_API_BASE>/api/v1"
  withCredentials: false,
  timeout: 15000,
});

// Attach Authorization header unless explicitly disabled with { sbForceAuth: false }
api.interceptors.request.use((config) => {
  const token = readToken();
  const wantAuth = config.sbForceAuth !== false; // default true
  if (wantAuth && token && !config.headers?.Authorization) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  if ("sbForceAuth" in config) delete config.sbForceAuth; // don't send custom flag
  return config;
});

export default api;
