import axios from "axios";
import { clearSession, readToken } from "../auth/session.js";

const env = import.meta.env || {};
const host = env.DEV ? "" : (env.VITE_API_BASE || "");
const api = axios.create({
  baseURL: `${String(host).replace(/\/+$/, "")}/api/v1`,
  withCredentials: false,
  timeout: 120000,
});

export function isAdminEndpoint(url = "") {
  return /^(?:\/api\/v1)?\/admin(?:\/|$)/.test(url);
}

function isPublicEndpoint(config) {
  const path = (config.url || "").split("?")[0];
  const method = (config.method || "get").toLowerCase();
  return path === "/authenticate" || path === "/admin/login"
    || (method === "post" && path === "/room-finder")
    || path.startsWith("/verify-email/")
    || (method === "get" && /^\/room-finder\/(?:public(?:\/|$)|\d+\/public(?:\/|$))/.test(path));
}

api.interceptors.request.use((config) => {
  const admin = isAdminEndpoint(config.url);
  const token = readToken(admin);
  if (config.sbForceAuth !== false && !isPublicEndpoint(config) && token
      && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
    config.sbSentToken = token;
    config.sbAdmin = admin;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  const config = error.config;
  if (error.response?.status === 401 && config?.sbSentToken
      && config.sbSentToken === readToken(config.sbAdmin)) {
    clearSession(config.sbAdmin);
    const onAdminPage = window.location.pathname.startsWith("/admin");
    if (config.sbAdmin === onAdminPage) {
      window.location.assign(config.sbAdmin ? "/admin/login" : "/login");
    }
  }
  return Promise.reject(error);
});

export default api;
