import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { AxiosError } from "axios";
import api, { isAdminEndpoint } from "../src/api/index.js";
import { readToken, safeRedirect } from "../src/auth/session.js";

class Storage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}
let redirects;
beforeEach(() => {
  globalThis.localStorage = new Storage();
  globalThis.sessionStorage = new Storage();
  redirects = [];
  globalThis.window = { dispatchEvent() {}, location: { pathname: "/profile", assign: value => redirects.push(value) } };
  api.defaults.adapter = async config => ({ config, data: {}, status: 200, statusText: "OK", headers: {} });
});
function reject401() {
  api.defaults.adapter = async config => { throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, { status: 401 }); };
}

test("token normalization falls back to valid session storage", () => {
  localStorage.setItem("token", "Bearer null");
  sessionStorage.setItem("token", " Bearer session-token ");
  assert.equal(readToken(), "session-token");
});
test("admin endpoint matching respects path boundaries", () => {
  assert.equal(isAdminEndpoint("/admin/me"), true);
  assert.equal(isAdminEndpoint("/room-finder/administered"), false);
});
test("admin and user requests use their own tokens", async () => {
  localStorage.setItem("token", "user-token");
  localStorage.setItem("adminToken", "admin-token");
  assert.equal((await api.get("/admin/me")).config.headers.get("Authorization"), "Bearer admin-token");
  assert.equal((await api.get("/room-finder/me")).config.headers.get("Authorization"), "Bearer user-token");
});
test("login and public listings do not attach stale credentials", async () => {
  localStorage.setItem("token", "stale");
  localStorage.setItem("adminToken", "stale");
  for (const url of ["/authenticate", "/admin/login"]) {
    assert.equal((await api.post(url)).config.headers.get("Authorization"), undefined);
  }
  assert.equal((await api.get("/room-finder/public?size=60")).config.headers.get("Authorization"), undefined);
});
test("expired sessions clear both stores while preserving the other account", async () => {
  localStorage.setItem("token", "expired");
  sessionStorage.setItem("token", "expired");
  sessionStorage.setItem("user", "private profile");
  localStorage.setItem("adminToken", "admin");
  reject401();
  await assert.rejects(api.get("/room-finder/me"));
  assert.equal(readToken(), null);
  assert.equal(sessionStorage.getItem("user"), null);
  assert.equal(readToken(true), "admin");
  assert.deepEqual(redirects, ["/login"]);
});
test("incorrect login stays on the form and preserves the current session", async () => {
  localStorage.setItem("token", "existing");
  reject401();
  await assert.rejects(api.post("/authenticate"));
  assert.equal(readToken(), "existing");
  assert.deepEqual(redirects, []);
});
test("late unauthorized responses do not clear a newer login", async () => {
  localStorage.setItem("token", "old");
  api.defaults.adapter = async config => {
    localStorage.setItem("token", "new");
    throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, { status: 401 });
  };
  await assert.rejects(api.get("/room-finder/me"));
  assert.equal(readToken(), "new");
  assert.deepEqual(redirects, []);
});
test("redirects remain inside the application", () => {
  assert.equal(safeRedirect("/matches?tab=new"), "/matches?tab=new");
  for (const value of ["//example.com", "/\\example.com", "https://example.com", ["/matches"], null]) {
    assert.equal(safeRedirect(value), "/dashboard");
  }
});
