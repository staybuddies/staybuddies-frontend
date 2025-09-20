<template>
  <article class="match-card">
    <!-- Top hero photo -->
    <div class="hero">
      <img v-if="resolvedPhoto" :src="resolvedPhoto" alt="avatar" />
      <div v-else class="hero-fallback">
        <span class="initial">{{ initial }}</span>
      </div>
    </div>

    <!-- Content under the photo -->
    <div class="mc-content">
      <div class="mc-head">
        <div class="mc-meta">
          <h3 class="mc-name">{{ match.name }}</h3>
          <p class="mc-sub">
            <span v-if="match.age">{{ match.age }} • </span>
            <span v-if="match.gender">{{ match.gender }} • </span>
            <span v-if="match.location">{{ match.location }}</span>
          </p>
        </div>

        <div class="mc-compat">
          <div class="mc-score">{{ match.compatibility }}%</div>
          <small>compatibility</small>
        </div>
      </div>

      <div class="mc-actions">
        <router-link
          class="match-btn-secondary"
          :to="{
            name: 'roomfinder-public',
            params: { id: String(match.userId) },
          }"
          title="View profile"
        >
          View Profile
        </router-link>

        <template v-if="match.relationStatus === 'NONE'">
          <button class="match-btn-primary" @click="$emit('send')">
            Send Request
          </button>
        </template>

        <template v-else-if="match.relationStatus === 'PENDING_SENT'">
          <button class="match-btn-disabled" disabled>Request Sent</button>
        </template>

        <template v-else-if="match.relationStatus === 'PENDING_RECEIVED'">
          <button class="match-btn-primary" @click="$emit('accept')">
            Accept
          </button>
          <button class="match-btn-secondary" @click="$emit('decline')">
            Decline
          </button>
        </template>

        <template v-else-if="match.relationStatus === 'ACCEPTED'">
          <button class="match-btn-primary" @click="goMessage">Message</button>
        </template>

        <template v-else-if="match.relationStatus === 'DECLINED'">
          <button class="match-btn-disabled" disabled>Declined</button>
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

/* photo handling */
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

/* actions */
function goMessage() {
  router.push({
    name: "messages",
    query: { with: String(props.match.userId) },
  });
}
</script>

<style scoped>
.match-card {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  position: relative; /* anchor any absolute children safely */
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
.mc-content {
  padding: 0.9rem 1rem 1rem;
  position: relative; /* neutralize any global absolute/fixed on "content" */
}

.mc-head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 0.75rem;
  margin-bottom: 0.7rem;
}

.mc-name {
  margin: 0;
  color: #0c4a23;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.mc-sub {
  margin: 0.25rem 0 0;
  color: #555;
  font-size: 0.95rem;
}

.mc-compat {
  text-align: right;
  min-width: 88px;
}

.mc-score {
  font-size: 1.6rem;
  font-weight: 900;
  color: #1b9536;
  line-height: 1;
}

/* Actions */
.mc-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Buttons */
.match-btn-primary {
  background: #1b9536;
  color: white;
  border: 0;
  padding: 0.55rem 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  font-family: inherit;
  font-size: inherit;
  transition: background-color 0.2s ease;
}
.match-btn-primary:hover:not(:disabled) {
  background: #157a2e;
}

.match-btn-secondary {
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
  font-family: inherit;
  font-size: inherit;
  transition: background-color 0.2s ease;
}
.match-btn-secondary:hover:not(:disabled) {
  background: #eafbf0;
}

.match-btn-disabled {
  background: #d9eadf;
  color: #398b53;
  border: 0;
  padding: 0.55rem 0.95rem;
  border-radius: 8px;
  font-weight: 800;
  cursor: not-allowed;
  font-family: inherit;
  font-size: inherit;
}

/* Small screens */
@media (max-width: 420px) {
  .mc-head {
    grid-template-columns: 1fr;
  }
  .mc-compat {
    text-align: left;
  }
  .mc-actions {
    flex-direction: column;
  }
  .match-btn-primary,
  .match-btn-secondary,
  .match-btn-disabled {
    width: 100%;
    justify-content: center;
  }
}

/* Focus styles */
.match-btn-primary:focus,
.match-btn-secondary:focus {
  outline: 2px solid #1b9536;
  outline-offset: 2px;
}
.match-btn-primary:focus {
  outline-color: white;
}
</style>
