<template>
  <header class="navbar">
    <div class="navbar-container">
      <!-- left: logo + brand -->
      <div class="left">
        <img src="@/assets/logo.png" alt="StayBuddies" class="logo" />
        <span class="brand">StayBuddies</span>
      </div>

      <!-- right: auth actions -->
      <div class="auth-actions" v-if="!isAuthed">
        <router-link class="btn ghost" to="/register">Sign up</router-link>
        <router-link class="btn primary" to="/login">Log in</router-link>
      </div>
      <div class="auth-actions" v-else>
        <button class="btn ghost" @click="logout">Log out</button>
      </div>
    </div>
  </header>

  <main class="home">
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
            <!-- changed: Browse -> Go To Dashboard with auth gate -->
            <button class="btn ghost" @click="goDashboard">
              Go To Dashboard
            </button>
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <div class="hero-slider" @mouseenter="pause()" @mouseleave="resume()">
            <div class="slides" :style="trackStyle">
              <div
                class="slide"
                v-for="(img, i) in images"
                :key="i"
                role="img"
                :aria-label="img.alt || 'Roommate photo'"
              >
                <img :src="img.src" :alt="img.alt || 'Roommate photo'" />
              </div>
            </div>

            <!-- controls (optional) -->
            <button class="nav prev" @click="prev" aria-label="Previous">
              &#10094;
            </button>
            <button class="nav next" @click="next" aria-label="Next">
              &#10095;
            </button>

            <!-- dots -->
            <div class="dots">
              <button
                v-for="(img, i) in images"
                :key="'dot-' + i"
                :class="['dot', { active: i === index }]"
                @click="go(i)"
                :aria-label="`Go to slide ${i + 1}`"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- featured listings -->
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
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

/* NEW: gated dashboard navigation */
function goDashboard() {
  if (isAuthed.value) {
    router.push("/dashboard");
  } else {
    router.push({ path: "/login", query: { redirect: "/dashboard" } });
  }
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

/* STATIC S3 PHOTOS: no timestamp / no changing query string */
function thumbStyle(url) {
  if (!url) return {};
  const u = absUrl(url);
  return { backgroundImage: `url("${u}")` };
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

/* ---------- hero slider (autoplay) ---------- */
const images = ref([
  {
    src: "/images/finding-roomate-2.jpg",
    alt: "Group studying in living room",
  },
  { src: "/images/image1.jpg", alt: "Roommates chatting" },
  { src: "/images/image2.jpg", alt: "Kitchen hangout" },
  { src: "/images/image3.jpg", alt: "Shared workspace" },
  { src: "/images/image4.jpg", alt: "Movie night" },
]);

const index = ref(0);
const intervalMs = 2000;
let timer = null;

const trackStyle = computed(() => ({
  transform: `translateX(-${index.value * 100}%)`,
}));

function next() {
  index.value = (index.value + 1) % images.value.length;
}
function prev() {
  index.value = (index.value - 1 + images.value.length) % images.value.length;
}
function go(i) {
  index.value = i;
}

const autoplay = true;

function start() {
  stop();
  if (!autoplay || images.value.length <= 1) return;
  timer = window.setInterval(next, intervalMs);
}
function stop() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}
function pause() {
  stop();
}
function resume() {
  start();
}

// pause when tab hidden, resume when visible
function handleVisibility() {
  if (document.hidden) stop();
  else start();
}

onMounted(() => {
  start();
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("blur", stop); // optional: pause when switching apps
  window.addEventListener("focus", start); // optional: resume on focus
});
onBeforeUnmount(() => {
  stop();
  document.removeEventListener("visibilitychange", handleVisibility);
  window.removeEventListener("blur", stop);
  window.removeEventListener("focus", start);
});
</script>

<style scoped>
/* HEADER (navbar + auth on one line) */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid #ddd;
  width: 100%;
}

.navbar-container {
  max-width: 1200px; /* match hero width */
  margin: 0 auto; /* center */
  padding: 0.75rem 1rem; /* comfy horizontal padding */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem; /* prevents crowding on small widths */
}

.left {
  display: flex;
  align-items: center;
  gap: 0.6rem; /* space between logo and brand */
  min-width: 0;
}

.logo {
  height: 40px; /* keep logo tidy */
  width: auto;
  display: block;
  object-fit: contain;
}

.brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #075a2a;
  white-space: nowrap;
}

.auth-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap; /* avoids overflow on narrow screens */
}

/* Remove the old topbar spacing if you still have it */
.topbar,
.topbar-inner {
  padding: 0;
  margin: 0;
}

/* RESPONSIVE: tighten padding and hide brand if it gets too tight */
@media (max-width: 560px) {
  .navbar-container {
    padding: 0.6rem 0.8rem;
  }
  .brand {
    display: none;
  } /* optional: keep just the icon on small screens */
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

/* HERO SLIDER */
.hero-art {
  position: relative;
  width: 100%;
}

.hero-slider {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #cbe8d2;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  /* Keep same visual size as before */
  max-height: 400px;
}

.slides {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 600ms ease;
  will-change: transform; /* GPU accelerated */
}

.slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.slide img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 400px;
  object-fit: cover;
}

/* Nav arrows */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.4rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.nav:hover {
  background: #fff;
}
.nav.prev {
  left: 10px;
}
.nav.next {
  right: 10px;
}

/* Dots */
.dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
.dot.active {
  background: #1b9536;
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

/* buttons */
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
