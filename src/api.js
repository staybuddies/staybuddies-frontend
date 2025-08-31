import axios from "axios";
import router from "@/router";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

// Endpoints that must be PUBLIC (no auth header)
const PUBLIC_PATHS = new Set([
  "/authenticate",
  "/room-finder", // registration
]);

api.interceptors.request.use((cfg) => {
  // Resolve absolute URL to check its pathname robustly
  const url = new URL(cfg.url, api.defaults.baseURL);
  const path = url.pathname.replace(/\/+$/, ""); // trim trailing slash

  if (!PUBLIC_PATHS.has(path)) {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  }
  return cfg;
});

/* -------------------------
   RESPONSE: handle suspension & auth errors
------------------------- */
api.interceptors.response.use(
  r => r,
  err => {
    const s = err?.response?.status;
    const code = err?.response?.data?.code;
    if (s === 423 || code === "SUSPENDED") {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      if (router.currentRoute.value?.path !== "/suspended") {
        router.replace("/suspended");
      }
    } else if (s === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      const current = router.currentRoute.value?.fullPath || "/";
      if (current !== "/login") {
        router.replace({ path: "/login", query: { redirect: current } });
      }
    }
    return Promise.reject(err);
  }
);

export default api;
