<template>
  <article class="card">
    <!-- Top hero photo -->
    <div class="hero">
      <img v-if="resolvedPhoto" :src="resolvedPhoto" alt="avatar" />
      <div v-else class="hero-fallback">
        <span class="initial">{{ initial }}</span>
      </div>
    </div>

    <!-- Content under the photo -->
    <div class="content">
      <div class="head">
        <div class="meta">
          <h3 class="name">{{ match.name }}</h3>
          <p class="sub">
            <span v-if="match.age">{{ match.age }} • </span>
            <span v-if="match.gender">{{ match.gender }} • </span>
            <span v-if="match.location">{{ match.location }}</span>
          </p>
        </div>

        <div class="compat">
          <div class="score">{{ match.compatibility }}%</div>
          <small>compatibility</small>
        </div>
      </div>

      <div class="actions">
        <router-link
          class="btn-secondary"
          :to="{
            name: 'roomfinder-public',
            params: { id: String(match.userId) },
          }"
          title="View profile"
        >
          View Profile
        </router-link>

        <template v-if="match.relationStatus === 'NONE'">
          <button class="btn-primary" @click="$emit('send')">
            Send Request
          </button>
        </template>

        <template v-else-if="match.relationStatus === 'PENDING_SENT'">
          <button class="btn-disabled" disabled>Request Sent</button>
        </template>

        <template v-else-if="match.relationStatus === 'PENDING_RECEIVED'">
          <button class="btn-primary" @click="$emit('accept')">Accept</button>
          <button class="btn-secondary" @click="$emit('decline')">
            Decline
          </button>
        </template>

        <template v-else-if="match.relationStatus === 'ACCEPTED'">
          <button class="btn-primary" @click="goMessage">Message</button>
        </template>

        <template v-else-if="match.relationStatus === 'DECLINED'">
          <button class="btn-disabled" disabled>Declined</button>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const props = defineProps({
  match: { type: Object, required: true },
});

const router = useRouter();

const initial = computed(() =>
  (props.match?.name || "?").trim().charAt(0).toUpperCase()
);

/* -------- photo handling (same as profile) -------- */
function toAbs(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE || window.location.origin;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

const fetchedPhoto = ref("");

const resolvedPhoto = computed(() => {
  const direct =
    props.match?.photoUrl || props.match?.photo || props.match?.avatarUrl || "";
  return direct ? toAbs(direct) : fetchedPhoto.value;
});

async function ensurePhoto() {
  const id = Number(props.match?.userId || 0);
  if (!id) return;
  if (props.match?.photoUrl || props.match?.photo || props.match?.avatarUrl) {
    fetchedPhoto.value = "";
    return;
  }
  try {
    const { data } = await api.get(`/room-finder/${id}/photo`, {
      params: { t: Date.now() },
    });
    fetchedPhoto.value = data?.url ? toAbs(data.url) : "";
  } catch {
    fetchedPhoto.value = "";
  }
}

onMounted(ensurePhoto);
watch(() => [props.match?.userId, props.match?.photoUrl], ensurePhoto);

/* -------- actions -------- */
function goMessage() {
  router.push({
    path: "/messages",
    query: { with: String(props.match.userId) },
  });
}
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 14px;
  overflow: hidden; /* keep photo corners rounded */
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}

/* Hero photo: full width, 4:3 */
.hero {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #f4f6f8;
}
.hero > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #e6fff1, #f7fff9);
  border-bottom: 1px solid #cfead9;
}
.initial {
  width: 120px;
  height: 120px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ffffff;
  color: #1b9536;
  font-weight: 900;
  font-size: 2.4rem;
  border: 2px solid #b8f1ce;
}

/* Content below the photo */
.content {
  padding: 0.9rem 1rem 1rem;
}
.head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 0.75rem;
  margin-bottom: 0.7rem;
}
.name {
  margin: 0;
  color: #0c4a23;
  font-weight: 900;
  letter-spacing: -0.01em;
}
.sub {
  margin: 0.25rem 0 0;
  color: #555;
  font-size: 0.95rem;
}
.compat {
  text-align: right;
  min-width: 88px;
}
.score {
  font-size: 1.6rem;
  font-weight: 900;
  color: #1b9536;
  line-height: 1;
}

/* Buttons */
.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.btn-primary {
  background: #1b9536;
  color: white;
  border: 0;
  padding: 0.55rem 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
}
.btn-secondary {
  background: white;
  color: #1b9536;
  border: 2px solid #1b9536;
  padding: 0.55rem 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn-disabled {
  background: #d9eadf;
  color: #398b53;
  border: 0;
  padding: 0.55rem 0.95rem;
  border-radius: 8px;
  font-weight: 800;
  cursor: not-allowed;
}

/* Small screens: stack neatly */
@media (max-width: 420px) {
  .head {
    grid-template-columns: 1fr;
  }
  .compat {
    text-align: left;
  }
}
</style>
