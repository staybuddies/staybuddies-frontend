<template>
  <main class="home">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="auth-actions" v-if="!isAuthed">
          <router-link class="btn ghost" to="/register">Sign up</router-link>
          <router-link class="btn primary" to="/login">Log in</router-link>
        </div>
        <div class="auth-actions" v-else>
          <button class="btn ghost" @click="logout">Log out</button>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="hero-inner">
        <div class="copy">
          <h1>Find Your Ideal Roommate<br />Today</h1>
          <p class="tagline">
            Explore the easiest way to connect and share your space with
            students like you.
          </p>
          <div class="cta-row">
            <button class="btn primary" @click="goQuiz">Take the Quiz</button>
            <router-link class="btn ghost" to="/browse"
              >Browse Listings</router-link
            >
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <img
            src="/images/finding-roomate-2.jpg"
            alt="Roommate Hero"
            class="hero-image"
          />
        </div>
      </div>
    </section>

    <!-- featured cards -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Featured Roommate Listings</h2>

        <div v-if="error" class="error">{{ error }}</div>

        <div v-if="loading" class="cards">
          <div class="card skeleton" v-for="i in 4" :key="i"></div>
        </div>

        <div v-else class="cards">
          <article
            class="card"
            v-for="c in listings"
            :key="c.id ?? `row-${Math.random()}`"
          >
            <div class="thumb" :style="thumbStyle(c.photoUrl)">
              <span v-if="!c.photoUrl" class="thumb-ph">No photo</span>
            </div>
            <div class="card-body">
              <h3 class="title">{{ c.name || "Roommate" }}</h3>
              <div class="meta">
                <span v-if="c.university">{{ c.university }}</span>
                <span v-if="c.location"> • {{ c.location }}</span>
              </div>
            </div>
            <div class="card-actions">
              <router-link
                v-if="c.id"
                class="btn ghost"
                :to="{
                  name: 'roomfinder-public',
                  params: { id: String(c.id) },
                }"
              >
                View Details
              </router-link>
              <button v-else class="btn ghost" disabled>View Details</button>
            </div>
          </article>

          <div v-if="!listings.length" class="empty">
            No featured users yet.
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();

/* ---------- auth ---------- */
const BAD_TOKENS = new Set([
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
  return BAD_TOKENS.has(t) ? null : t;
}
function isJwtValid(jwt) {
  const parts = (jwt || "").split(".");
  if (parts.length !== 3) return !!jwt;
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
function goQuiz() {
  isAuthed.value
    ? router.push("/quiz")
    : router.push({ path: "/login", query: { redirect: "/quiz" } });
}

/* ---------- featured listings ---------- */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const listings = reactive([]);
const loading = ref(false);
const error = ref("");

function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}
function thumbStyle(url) {
  if (!url) return {};
  const u = absUrl(url);
  return {
    backgroundImage: `url("${u}${u.includes("?") ? "&" : "?"}t=${Date.now()}")`,
  };
}

async function fetchFeatured() {
  loading.value = true;
  error.value = "";
  listings.splice(0);

  try {
    const { data } = await api.get("/room-finder/public?size=8");
    const rows = Array.isArray(data) ? data : data?.content || [];
    rows.forEach((r) => {
      listings.push({
        id: r.id,
        name: r.name,
        university: r.university,
        location: r.location,
        photoUrl: r.photoUrl,
      });
    });
  } catch (e) {
    console.error(e);
    error.value = "Could not load featured users.";
  } finally {
    loading.value = false;
  }
}

/* ---------- lifecycle ---------- */
onMounted(() => {
  refreshAuth();
  fetchFeatured();
  window.addEventListener("sb-auth-changed", refreshAuth);
  window.addEventListener("focus", refreshAuth);
});
onBeforeUnmount(() => {
  window.removeEventListener("sb-auth-changed", refreshAuth);
  window.removeEventListener("focus", refreshAuth);
});
</script>

<style scoped>
/* (unchanged styles)… */
</style>

<style scoped>
.home {
  min-height: 100vh;
  background: #fff;
}

/* your original auth-only topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: transparent;
}
.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.auth-actions {
  display: flex;
  gap: 0.6rem;
}

/* hero */
.hero {
  background: #f2fff3;
  border-bottom: 1px solid #edf5ef;
}
.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.2rem 1rem 2.8rem;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  align-items: center;
}
.copy h1 {
  margin: 0 0 0.6rem;
  font-size: clamp(2rem, 4.8vw, 3.1rem);
  color: #075a2a;
}
.tagline {
  color: #315343;
  margin: 0 0 1rem;
}
.cta-row {
  display: flex;
  gap: 0.65rem;
}
.hero-art .placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 16px;
  background: #cfdad2;
  opacity: 0.65;
  border: 1px solid #cbe8d2;
}
.hero-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid #cbe8d2;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.section {
  padding: 1.6rem 0 2.6rem;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
.section-title {
  margin: 0 0 0.9rem;
  color: #0c4a23;
  font-size: 1.25rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.card {
  background: #fff;
  border: 1px solid #cbe8d2;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
}
.thumb {
  height: 180px;
  background: #eef7f1;
  background-size: cover;
  background-position: center;
}
.thumb-ph {
  color: #6b7b74;
  padding: 0.6rem;
  display: inline-block;
}
.card-body {
  padding: 0.75rem 0.9rem 0.3rem;
}
.title {
  margin: 0 0 0.25rem;
  color: #0c4a23;
  font-size: 1.05rem;
}
.meta {
  color: #597168;
  font-size: 0.92rem;
}
.card-actions {
  padding: 0.7rem 0.9rem 1rem;
  margin-top: auto;
}

/* buttons (keep your palette) */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0.8rem 1.1rem;
  font-weight: 800;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn.primary {
  background: #1b9536;
  color: #fff;
  border-color: #1b9536;
}
.btn.ghost {
  background: #e6fff1;
  color: #1b9536;
  border-color: #a6e0bb;
}
.btn.outline {
  background: #fff;
  color: #1b9536;
  border-color: #a6e0bb;
}

.error {
  color: #c92a2a;
  margin: 0.5rem 0;
}
.empty {
  color: #597168;
  padding: 0.8rem 0;
}

/* skeleton shimmer */
.skeleton {
  height: 260px;
  border-radius: 14px;
  border: 1px solid #cbe8d2;
  background: linear-gradient(90deg, #f2fbf5 25%, #e9f6ee 37%, #f2fbf5 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}

@media (max-width: 980px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
