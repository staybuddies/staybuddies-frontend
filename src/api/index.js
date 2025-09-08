import axios from "axios";
import router from "@/router";

const api = axios.create({
  baseURL: "/api/v1", 
});

const PUBLIC_SUFFIXES = [
  "/authenticate",      // POST register/login token
  "/room-finder",       // POST registration
];

// Robust path check that also works with relative baseURL
function isPublicPath(pathname) {
  // Match by suffix so it works whether the server prefixes with /api/v1 or not
  return PUBLIC_SUFFIXES.some(suffix => pathname.endsWith(suffix));
}

api.interceptors.request.use((cfg) => {
  // Build an absolute URL safely for inspection only
  const base = (cfg.baseURL ?? api.defaults.baseURL ?? "");
  const joined =
    (cfg.url?.startsWith("http")
      ? cfg.url
      : [base, cfg.url || ""]
          .map((p) => String(p || "").replace(/^\/+|\/+$/g, "")) // trim slashes
          .filter(Boolean)
          .join("/")) || "/";

  // Make it absolute using the current origin so URL parsing never throws
  const url = new URL(joined.startsWith("http") ? joined : `/${joined}`, window.location.origin);
  const pathname = url.pathname.replace(/\/+$/, ""); // trim trailing slash

  if (!isPublicPath(pathname)) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
  (r) => r,
  (err) => {
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
