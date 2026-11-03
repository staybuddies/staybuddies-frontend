const INVALID_TOKENS = new Set(["", "null", "undefined", "Bearer"]);

export function readToken(admin = false) {
  const key = admin ? "adminToken" : "token";
  for (const storage of [localStorage, sessionStorage]) {
    const token = (storage.getItem(key) || "").trim().replace(/^Bearer\s+/i, "").trim();
    if (!INVALID_TOKENS.has(token)) return token;
  }
  return null;
}

export function clearSession(admin = false) {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(admin ? "adminToken" : "token");
    storage.removeItem(admin ? "adminUser" : "user");
  }
  window.dispatchEvent(new Event("sb-auth-changed"));
}

export function safeRedirect(value, fallback = "/dashboard") {
  return typeof value === "string" && /^\/(?![\\/])/.test(value) ? value : fallback;
}
