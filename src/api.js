import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

// Endpoints that must be PUBLIC (no auth header)
const PUBLIC_PATHS = new Set([
  "/authenticate",
  "/room-finder",           // registration
]);

api.interceptors.request.use((cfg) => {
  // Build an absolute URL to check the pathname robustly
  const url = new URL(cfg.url, api.defaults.baseURL);
  const path = url.pathname.replace(/\/+$/, ""); // trim trailing slash

  // Don’t attach token on public endpoints
  if (!PUBLIC_PATHS.has(path)) {
    const token = localStorage.getItem("token");
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  }
  return cfg;
});

export default api;
