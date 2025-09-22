<template>
  <header class="rm-navbar">
    <div class="rm-wrap">
      <!-- Left: brand -->
      <router-link to="/" class="rm-left" aria-label="StayBuddies Home">
        <img src="@/assets/logo.png" alt="StayBuddies" class="rm-logo" />
        <span class="rm-brand">StayBuddies</span>
      </router-link>

      <!-- Center: page anchors -->
      <nav class="rm-center" aria-label="Primary">
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#testimonials">Testimonials</a>
        <a href="#about-us">About Us</a>
      </nav>

      <!-- Right: auth actions -->
      <div class="rm-right" v-if="!isAuthed">
        <router-link class="rm-btn outline" to="/login">Log In</router-link>
        <router-link class="rm-btn primary" to="/register">Sign Up</router-link>
      </div>
      <div class="rm-right" v-else>
        <button class="rm-btn ghost" @click="logout">Log out</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

/* minimal token-based auth parity with Home.vue */
const BAD = new Set([
  "",
  "null",
  "undefined",
  "Bearer",
  "Bearer null",
  "Bearer undefined",
]);
const isAuthed = ref(false);

function readToken() {
  let t =
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  t = (t || "").trim();
  if (t.startsWith("Bearer ")) t = t.slice(7).trim();
  return BAD.has(t) ? null : t;
}
function isJwtValid(jwt) {
  const parts = (jwt || "").split(".");
  if (parts.length !== 3) return !!jwt; // treat opaque tokens as truthy
  try {
    const payload = JSON.parse(atob(parts[1]));
    return !(payload?.exp && Date.now() >= payload.exp * 1000);
  } catch {
    return !!jwt;
  }
}
function refreshAuth() {
  const t = readToken();
  const ok = !!t && isJwtValid(t);
  isAuthed.value = ok;
  if (!ok) {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }
}
function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.dispatchEvent(new Event("sb-auth-changed"));
  refreshAuth();
  router.replace("/login");
}

onMounted(() => {
  refreshAuth();
  window.addEventListener("sb-auth-changed", refreshAuth);
  window.addEventListener("focus", refreshAuth);
});
onBeforeUnmount(() => {
  window.removeEventListener("sb-auth-changed", refreshAuth);
  window.removeEventListener("focus", refreshAuth);
});
</script>

<style scoped>
/* --- Tunable vars --- */
/* NavBar (scoped) — left | absolute-centered | right */
.rm-navbar {
  /* brand tokens scoped to the navbar */
  --brand-green: #1b7f3a;
  --brand-green-dark: #0f6130;
  --bar-border: #e9ecef;

  background: #fff;
  border-bottom: 1px solid var(--bar-border);
  position: sticky;
  top: 0;
  z-index: 1000;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Edges hug container; center is absolutely centered */
.rm-wrap {
  max-width: 100%;
  margin: 0 auto;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* left & right to edges */
  min-height: 56px;
  position: relative; /* anchor for absolute center */
}

/* Left (logo + brand) */
.rm-left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.rm-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.rm-brand {
  font-weight: 800;
  color: var(--brand-green);
  font-size: 1.6rem;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

/* Center (links) — perfectly centered regardless of edges width */
.rm-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 56px;
}
.rm-center a {
  color: var(--brand-green);
  text-decoration: none;
  font-weight: 800;
  font-size: 1.15rem;
  line-height: 1;
}
.rm-center a:hover,
.rm-center a:focus {
  color: var(--brand-green-dark);
  text-decoration: underline;
}

/* Right (auth buttons) */
.rm-right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

/* Buttons */
.rm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 14px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
}
.rm-btn.outline {
  background: #fff;
  color: var(--brand-green-dark);
  border-color: var(--brand-green-dark);
}
.rm-btn.primary {
  background: var(--brand-green);
  color: #fff;
  border-color: var(--brand-green);
}
.rm-btn.ghost {
  background: #e6fff1;
  color: var(--brand-green);
  border-color: #a6e0bb;
}

/* Responsive: hide center links on small screens */
@media (max-width: 760px) {
  .rm-center {
    display: none;
  }
  .rm-brand {
    font-size: 1.35rem;
  }
}
</style>
