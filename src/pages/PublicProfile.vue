<!-- src/pages/PublicProfile.vue -->
<template>
  <div>
    <Navbar />

    <section class="profile">
      <div v-if="loading" class="loading">Loading…</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && !error && profile" class="card">
        <!-- HERO: big photo on the left, details on the right -->
        <div class="hero-grid">
          <div class="hero-photo">
            <img v-if="photoUrl" :src="photoUrl" alt="avatar" />
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

            <div class="bullets">
              <div v-if="profile.university" class="bullet">
                <i>🎓</i>{{ profile.university }}
              </div>
              <div v-if="profile.major" class="bullet">
                <i>📘</i>{{ profile.major }}
              </div>
            </div>

            <p class="desc" v-if="profile.bio">
              <b>About:</b> {{ profile.bio }}
            </p>
            <p class="desc muted" v-else>
              This user hasn’t added an about/bio yet.
            </p>
          </div>
        </div>

        <!-- Sections (unchanged) -->
        <div class="section">
          <h3 class="section-title">Lifestyle</h3>
          <div v-if="(profile.lifestyleTags || []).length" class="chips">
            <span v-for="t in profile.lifestyleTags" :key="t" class="chip">{{
              t
            }}</span>
          </div>
          <p v-else class="muted">No lifestyle tags available yet.</p>
        </div>

        <div class="section">
          <h3 class="section-title">Why You Match</h3>
          <ul v-if="(profile.whyYouMatch || []).length" class="reasons">
            <li v-for="(r, i) in profile.whyYouMatch" :key="i">{{ r }}</li>
          </ul>
          <p v-else class="muted">
            We’ll explain matches once both of you complete the quiz.
          </p>
        </div>

        <div class="cta-row">
          <button
            v-if="relation === 'NONE'"
            class="btn btn-primary btn-lg"
            @click="sendRequest"
            :disabled="busy"
          >
            {{ busy ? "Sending…" : "Send Request" }}
          </button>

          <button
            v-else-if="relation === 'PENDING_SENT'"
            class="btn btn-disabled btn-lg"
            disabled
          >
            Request Sent
          </button>

          <div v-else-if="relation === 'PENDING_RECEIVED'" class="hint">
            This user sent you a request. Go to Matches to accept/decline.
          </div>

          <button
            v-else-if="relation === 'ACCEPTED'"
            class="btn btn-primary btn-lg"
            @click="goMessage"
          >
            Message
          </button>

          <button
            v-else-if="relation === 'DECLINED'"
            class="btn btn-disabled btn-lg"
            disabled
          >
            Declined
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import api from "@/api";

const route = useRoute();
const router = useRouter();

const id = Number(route.params.id);
const loading = ref(true);
const busy = ref(false);
const error = ref("");
const profile = ref(null);

const relation = ref("NONE");
const requestId = ref(null);
const threadId = ref(null);

const photoUrl = ref("");

const initial = computed(() =>
  (profile.value?.name || "?").charAt(0).toUpperCase()
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get(`/room-finder/${id}/public`);
    profile.value = data;

    try {
      const r = await api.get(`/room-finder/${id}/photo`);
      photoUrl.value = r.data?.url || "";
    } catch {
      photoUrl.value = "";
    }

    const res = await api.get("/matches");
    const m = Array.isArray(res.data)
      ? res.data.find((x) => x.userId === id)
      : null;
    if (m) {
      relation.value = m.relationStatus || "NONE";
      requestId.value = m.requestId ?? null;
      threadId.value = m.threadId ?? null;
    } else {
      relation.value = "NONE";
      requestId.value = null;
      threadId.value = null;
    }
  } catch (e) {
    console.error(e);
    error.value = "Could not load profile.";
  } finally {
    loading.value = false;
  }
}

async function sendRequest() {
  busy.value = true;
  try {
    const { data } = await api.post(`/matches/${id}/request`);
    relation.value = "PENDING_SENT";
    requestId.value = data?.requestId ?? null;
  } catch (e) {
    console.error(e);
    alert("Could not send request.");
  } finally {
    busy.value = false;
  }
}

async function goMessage() {
  try {
    if (!threadId.value) {
      const { data } = await api.post(`/messages/thread-with/${id}`);
      threadId.value = data.threadId;
    }
    router.push({
      path: "/messages",
      query: { thread: String(threadId.value) },
    });
  } catch (e) {
    console.error(e);
    alert("Could not open chat.");
  }
}

onMounted(load);
</script>

<style scoped>
.profile {
  background: #fff;
  min-height: 100vh;
  padding: clamp(1rem, 2vw, 2rem);
}

/* Card + Hero */
.card {
  width: min(1200px, 96vw);
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  padding: 1.25rem;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
  font-size: 1.03rem; /* base text a touch bigger */
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(260px, 540px) 1fr;
  gap: 1.25rem;
  align-items: start;
}
.hero-photo {
  position: relative;
  aspect-ratio: 4 / 3;
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
  font-size: clamp(2.6rem, 3.8vw, 3.2rem); /* larger */
  font-weight: 1000;
  color: #0c4a23;
}
.hero-sub {
  margin: 0.65rem 0 0.95rem;
  color: #3d3d3d;
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  font-size: 1.1rem; /* larger */
}
.hero-sub .row i {
  margin-right: 0.45rem;
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

/* Sections */
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

/* CTA row */
.cta-row {
  margin-top: 1.25rem;
  padding-top: 0.95rem;
  display: flex;
  gap: 0.7rem;
  border-top: 1px solid #e8f3ea;
}
.btn {
  border: 0;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
}
.btn-lg {
  padding: 0.8rem 1.3rem;
  font-size: 1.05rem;
}
.btn-primary {
  background: #1b9536;
  color: #fff;
}
.btn-disabled {
  background: #eee;
  color: #999;
  cursor: not-allowed;
}
.hint {
  color: #555;
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
