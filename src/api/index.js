import axios from "axios";

const DEV = import.meta.env.DEV;
const API_HOST = DEV ? "" : (import.meta.env.VITE_API_BASE || "");
const BASE = `${String(API_HOST).replace(/\/+$/, "")}/api/v1`;

function readToken() {
  let t = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  t = (t || "").trim();
  return t ? (t.startsWith("Bearer ") ? t.slice(7) : t) : null;
}

function readAdminToken() {
  let t = localStorage.getItem("adminToken") || "";
  t = (t || "").trim();
  return t ? (t.startsWith("Bearer ") ? t.slice(7) : t) : null;
}

const api = axios.create({
  baseURL: BASE,
  withCredentials: false,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const isAdminEndpoint = config.url?.includes("/admin");
  
  let token;
  if (isAdminEndpoint) {
    token = readAdminToken();
  } else {
    token = readToken();
  }
  
  const wantAuth = config.sbForceAuth !== false;
  if (wantAuth && token && !config.headers?.Authorization) {
    config.headers = { 
      ...(config.headers || {}), 
      Authorization: `Bearer ${token}` 
    };
  }
  
  if ("sbForceAuth" in config) delete config.sbForceAuth;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminEndpoint = error.config?.url?.includes("/admin");
      
      if (isAdminEndpoint) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.startsWith("/admin")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;