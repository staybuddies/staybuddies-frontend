<template>
  <section class="profile">
    <div class="toolbar">
      <button class="btn btn-ghost" @click="goBack">← Back</button>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="profile" class="card">
      <div class="hero-grid">
        <div class="hero-photo">
          <img v-if="resolvedPhoto" :src="resolvedPhoto" alt="avatar" />
          <div v-else class="hero-placeholder">
            <span class="initial">{{ initial }}</span>
          </div>
        </div>

        <div class="hero-info">
          <h1 class="hero-title">{{ profile.name }}</h1>

          <p class="hero-sub">
            <span v-if="profile.location" class="row"
              ><i>📍</i>{{ profile.location }}</span
            >
            <span v-if="profile.age" class="row"
              ><i>🎂</i>{{ profile.age }}</span
            >
            <span v-if="profile.gender" class="row"
              ><i>🧑</i>{{ profile.gender }}</span
            >
          </p>

          <!-- ✅ Verification / housing badges -->
          <div class="badges">
            <span class="badge" :class="profile.emailVerified ? 'ok' : 'muted'">
              <strong>Email</strong>
              {{ profile.emailVerified ? "verified" : "not verified" }}
              <template v-if="profile.schoolEmail">
                ({{ emailDomain(profile.schoolEmail) }})</template
              >
            </span>
            <span
              class="badge"
              :class="profile.identityVerified ? 'ok' : 'muted'"
            >
              <strong>ID</strong>
              {{ profile.identityVerified ? "verified" : "not verified" }}
            </span>
            <span class="badge" :class="profile.alreadyHasRoom ? 'warn' : 'ok'">
              <strong>{{
                profile.alreadyHasRoom ? "Already has room" : "Looking for room"
              }}</strong>
            </span>
          </div>

          <div class="bullets">
            <div v-if="profile.university" class="bullet">
              <i>🎓</i>{{ profile.university }}
            </div>
            <div v-if="profile.major" class="bullet">
              <i>📘</i>{{ profile.major }}
            </div>
          </div>

          <p class="desc" v-if="profile.bio"><b>About:</b> {{ profile.bio }}</p>
          <p class="desc muted" v-else>
            This user hasn’t added an about/bio yet.
          </p>
        </div>
      </div>

      <!-- Lifestyle tags -->
      <div class="section">
        <h3 class="section-title">Lifestyle</h3>
        <div v-if="(profile.lifestyleTags || []).length" class="chips">
          <span v-for="t in profile.lifestyleTags" :key="t" class="chip">{{
            t
          }}</span>
        </div>
        <p v-else class="muted">No lifestyle tags available yet.</p>
      </div>

      <!-- Why you match -->
      <div class="section">
        <h3 class="section-title">Similar Preferences</h3>
        <ul v-if="(profile.whyYouMatch || []).length" class="reasons">
          <li v-for="(r, i) in profile.whyYouMatch" :key="i">{{ r }}</li>
        </ul>
        <p v-else class="muted">
          We’ll explain matches once both of you complete the quiz.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api";

const route = useRoute();
const router = useRouter();

const id = ref(Number(route.params.id || 0));
const loading = ref(true);
const error = ref("");
const profile = ref(null);
const fallbackPhoto = ref("");

const initial = computed(() =>
  (profile.value?.name || "?").charAt(0).toUpperCase()
);

function toAbs(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE || window.location.origin;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

const resolvedPhoto = computed(() => {
  const a = profile.value?.photoUrl ? toAbs(profile.value.photoUrl) : "";
  return a || fallbackPhoto.value || "";
});

function emailDomain(e) {
  if (!e) return "";
  const at = e.indexOf("@");
  return at > 0 ? e.slice(at + 1) : e;
}

async function load() {
  if (!id.value) {
    error.value = "Invalid profile id.";
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = "";
  profile.value = null;
  fallbackPhoto.value = "";

  try {
    const { data } = await api.get(`/room-finder/${id.value}/public`);
    profile.value = data;

    if (!profile.value?.photoUrl) {
      try {
        const r = await api.get(`/room-finder/${id.value}/photo`);
        fallbackPhoto.value = r?.data?.url ? toAbs(r.data.url) : "";
      } catch {
        fallbackPhoto.value = "";
      }
    }
  } catch (e) {
    console.error(e);
    error.value = "Could not load profile.";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push({ name: "home" });
}

onMounted(load);
watch(
  () => route.params.id,
  (v) => {
    id.value = Number(v || 0);
    load();
  }
);
</script>

<style scoped>
.profile {
  background: #fff;
  min-height: 100vh;
  padding: clamp(1rem, 2vw, 2rem);
}
.toolbar {
  width: min(1200px, 96vw);
  margin: 0 auto 0.75rem;
}

.card {
  width: min(1200px, 96vw);
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  padding: 1.25rem;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
  font-size: 1.03rem;
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(260px, 540px) 1fr;
  gap: 1.25rem;
  align-items: start;
}
.hero-photo {
  position: relative;
  aspect-ratio: 4/3;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e8f3ea;
}
.hero-photo > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.initial {
  width: 100px;
  height: 100px;
  border-radius: 999px;
  background: #e6fff1;
  color: #1b9536;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 2.4rem;
  border: 1px solid #b8f1ce;
}
.hero-info {
  padding-top: 0.2rem;
}
.hero-title {
  margin: 0;
  font-size: clamp(2.6rem, 3.8vw, 3.2rem);
  font-weight: 1000;
  color: #0c4a23;
}
.hero-sub {
  margin: 0.65rem 0 0.95rem;
  color: #3d3d3d;
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  font-size: 1.1rem;
}
.hero-sub .row i {
  margin-right: 0.45rem;
}

/* ✅ new badges */
.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}
.badge {
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  border: 1px solid #cbe8d2;
  background: #f6fff9;
  color: #0c4a23;
  font-weight: 800;
  font-size: 0.9rem;
}
.badge.ok {
  background: #e6fff1;
  border-color: #b8f1ce;
  color: #1b9536;
}
.badge.warn {
  background: #fff7e6;
  border-color: #f3d7a6;
  color: #b76e00;
}
.badge.muted {
  background: #f4f5f6;
  border-color: #e1e6ea;
  color: #707e86;
}

.bullets {
  display: grid;
  gap: 0.45rem;
  margin-bottom: 0.7rem;
}
.bullet {
  color: #0c4a23;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 1.06rem;
}
.desc {
  color: #344054;
  line-height: 1.55;
  font-size: 1.06rem;
}
.muted {
  color: #667085;
}

.section {
  margin-top: 1.1rem;
}
.section-title {
  margin: 0 0 0.55rem;
  color: #0c4a23;
  font-weight: 850;
  font-size: 1.18rem;
}
.chips {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.chip {
  background: #e6fff1;
  border: 1px solid #b8f1ce;
  color: #1b9536;
  padding: 0.36rem 0.78rem;
  border-radius: 999px;
  font-size: 0.94rem;
  font-weight: 800;
}
.reasons {
  margin: 0.4rem 0 0;
  padding-left: 1.2rem;
}
.reasons li {
  position: relative;
  margin: 0.28rem 0;
  color: #0c4a23;
  line-height: 1.55;
}
.reasons li::marker {
  content: "";
}
.reasons li::before {
  content: "";
  position: absolute;
  left: -0.95rem;
  top: 0.58rem;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1b9536;
}

.btn {
  border: 0;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
}
.btn-ghost {
  background: #e6fff1;
  color: #1b9536;
  border: 1px solid #b8f1ce;
  padding: 0.55rem 0.9rem;
}
.loading {
  color: #555;
}
.error {
  color: #c92a2a;
}

@media (max-width: 980px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}
</style>
