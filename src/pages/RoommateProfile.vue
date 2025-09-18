<template>
  <section class="profile">
    <div class="toolbar">
      <button class="btn btn-ghost" @click="goBack">← Back</button>
    </div>

    <div v-if="loading" class="loading">Loading…</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="profile" class="card">
      <div class="hero-grid">
        <!-- Photo -->
        <div class="hero-photo">
          <img v-if="resolvedPhoto" :src="resolvedPhoto" alt="avatar" />
          <div v-else class="hero-placeholder">
            <span class="initial">{{ initial }}</span>
          </div>
        </div>

        <!-- Info -->
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

          <!-- Badges -->
          <div class="badges">
            <span class="badge" :class="profile.emailVerified ? 'ok' : 'muted'">
              <strong>Email</strong>
              {{ profile.emailVerified ? "verified" : "not verified" }}
              <template v-if="profile.schoolEmail"
                >({{ emailDomain(profile.schoolEmail) }})</template
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

            <span class="badge" :class="isMatched ? 'ok' : 'muted'">
              <strong>Status</strong>
              {{ isMatched ? "Matched" : "Unmatched" }}
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

      <!-- Lifestyle -->
      <div class="section">
        <h3 class="section-title">Lifestyle</h3>
        <div v-if="lifeTags.length" class="chips">
          <span v-for="t in lifeTags" :key="t" class="chip">{{ t }}</span>
        </div>
        <p v-else class="muted">No lifestyle tags available yet.</p>
      </div>

      <!-- Similar prefs -->
      <div class="section">
        <h3 class="section-title">Similar Preferences</h3>
        <ul v-if="(profile.whyYouMatch || []).length" class="reasons">
          <li v-for="(r, i) in profile.whyYouMatch" :key="i">{{ r }}</li>
        </ul>
        <p v-else class="muted">
          We’ll explain matches once both of you complete the quiz.
        </p>
      </div>

      <!-- Debug (open with ?debug=1) -->
      <div v-if="debug" class="debug">
        <div class="debug-head">
          <strong>Debug</strong>
          <div class="debug-actions">
            <button class="btn btn-ghost" @click="load">Force refresh</button>
          </div>
        </div>
        <div class="debug-grid">
          <div class="debug-kv">
            <b>emailVerified:</b> {{ !!profile.emailVerified }}
          </div>
          <div class="debug-kv">
            <b>identityVerified:</b> {{ !!profile.identityVerified }}
          </div>
        </div>
        <pre class="debug-pre">{{
          JSON.stringify(
            {
              emailVerified: profile.emailVerified,
              identityVerified: profile.identityVerified,
            },
            null,
            2
          )
        }}</pre>
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
const debug = ref(String(route.query.debug || "") === "1");

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

const isMatched = computed(() => {
  // profile.status is MatchStatus enum; compare by name string
  const s = String(profile.value?.status || "").toUpperCase();
  return ["MATCHED", "ACCEPTED", "APPROVED"].includes(s);
});

/* ----- Lifestyle tag derivation (uses lifestyleAnswers first) ----- */
const budgetLabels = [
  "≤ 4,000 THB",
  "4,001–6,000 THB",
  "6,001–8,000 THB",
  "8,001–10,000 THB",
  "> 10,000 THB",
];
const regionLabels = [
  "Thai",
  "ASEAN (non-Thai)",
  "East/South Asia",
  "Europe/Americas/Oceania",
  "Other / Prefer not to say",
];

function tagsFromAnswers(a = []) {
  const out = [];

  // Detect the scale for the whole array:
  // zeroBased = values are 0..4 (no 5 present and max <= 4)
  const nums = (Array.isArray(a) ? a : []).filter((x) => typeof x === "number");
  const hasAny = nums.length > 0;
  const maxVal = hasAny ? Math.max(...nums) : null;
  const zeroBased = hasAny && maxVal <= 4 && !nums.includes(5);

  const v = (i) => {
    const x = Array.isArray(a) ? a[i] : null;
    if (x == null) return null;
    return zeroBased ? x + 1 : x; // only add +1 if the whole set is 0..4
  };

  // ---- the rest stays the same, using v(i) ----
  const s = v(0);
  if (s != null)
    out.push(s <= 2 ? "Night owl" : s >= 4 ? "Early bird" : "Neutral schedule");

  const t = v(1);
  if (t != null)
    out.push(
      t >= 5
        ? "Extremely tidy"
        : t >= 4
        ? "Very tidy"
        : t <= 2
        ? "Relaxed about tidiness"
        : "Moderately tidy"
    );

  const n = v(2);
  if (n != null)
    out.push(
      n <= 2
        ? "Very noise tolerant"
        : n >= 4
        ? "Needs quiet"
        : "Moderate noise tolerance"
    );

  const g = v(3);
  if (g != null)
    out.push(
      g <= 2
        ? "Very social"
        : g === 3
        ? "Moderately social"
        : "Low guest frequency"
    );

  const p = v(4);
  if (p != null)
    out.push(
      p >= 4
        ? "Pet friendly"
        : p === 3
        ? "Neutral with pets"
        : "Prefers no pets"
    );

  const sm = v(5);
  if (sm != null)
    out.push(
      sm >= 5
        ? "Smoke-free home"
        : sm >= 4
        ? "Outdoor only"
        : "Some smoking tolerance"
    );

  const c = v(6);
  if (c != null)
    out.push(
      c >= 4
        ? "Great communicator"
        : c === 3
        ? "Neutral communicator"
        : "Avoids confrontation"
    );

  const sa = v(7);
  if (sa != null)
    out.push(
      sa >= 4
        ? "Values aligned schedules"
        : sa <= 2
        ? "Flexible schedules"
        : "Some schedule alignment"
    );

  const budgetLabels = [
    "≤ 4,000 THB",
    "4,001–6,000 THB",
    "6,001–8,000 THB",
    "8,001–10,000 THB",
    "> 10,000 THB",
  ];
  const regionLabels = [
    "Thai",
    "ASEAN (non-Thai)",
    "East/South Asia",
    "Europe/Americas/Oceania",
    "Other / Prefer not to say",
  ];

  const b = v(8);
  if (b != null && budgetLabels[b - 1])
    out.push(`Budget: ${budgetLabels[b - 1]}`);

  const r = v(9);
  if (r != null && regionLabels[r - 1])
    out.push(`Region: ${regionLabels[r - 1]}`);

  return out;
}

const lifeTags = computed(() => {
  const tags = profile.value?.lifestyleTags;
  if (Array.isArray(tags) && tags.length) return tags; //  from backend
  const ans = profile.value?.lifestyleAnswers;
  return Array.isArray(ans) ? tagsFromAnswers(ans) : []; // fallback
});

/* ----- Data loading ----- */
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
    // Public profile (your DTO now includes emailVerified & identityVerified)
    const { data } = await api.get(`/room-finder/${id.value}/public`, {
      params: { t: Date.now() }, // cache-buster
    });
    profile.value = data;

    // If no explicit photo URL, ask the photo endpoint for a signed/absolute URL
    if (!profile.value?.photoUrl) {
      try {
        const r = await api.get(`/room-finder/${id.value}/photo`, {
          params: { t: Date.now() },
        });
        fallbackPhoto.value = r?.data?.url ? toAbs(r.data.url) : "";
      } catch {
        fallbackPhoto.value = "";
      }
    }

    if (debug.value) {
      // quick visibility while you verify end-to-end
      console.log("[RoommateProfile] public payload:", profile.value);
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

/* badges */
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

/* Debug panel */
.debug {
  margin-top: 1rem;
  border: 1px dashed #b8f1ce;
  background: #f6fff9;
  border-radius: 10px;
  padding: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
}
.debug-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.debug-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.debug-kv {
  font-size: 0.92rem;
  color: #0c4a23;
}
.debug-pre {
  margin-top: 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.88rem;
  color: #0c4a23;
}
</style>
