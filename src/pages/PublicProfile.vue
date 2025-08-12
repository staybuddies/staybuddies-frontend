<template>
  <div>
    <Navbar />

    <section class="profile">
      <div v-if="loading" class="loading">Loading…</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && !error && profile" class="card">
        <div class="header">
          <div class="avatar">{{ initial }}</div>
          <div>
            <h1>{{ profile.name }}</h1>
            <p class="sub">
              <span v-if="profile.age">{{ profile.age }} • </span>
              <span v-if="profile.gender">{{ profile.gender }} • </span>
              <span v-if="profile.location">{{ profile.location }}</span>
            </p>
          </div>
        </div>

        <div class="grid">
          <div>
            <h3>University</h3>
            <p>{{ profile.university || "-" }}</p>
          </div>
          <div>
            <h3>About</h3>
            <p class="muted">
              More details can go here later (bio, lifestyle, etc.).
            </p>
          </div>
        </div>

        <div class="actions">
          <button
            v-if="relation === 'NONE'"
            class="btn-primary"
            @click="sendRequest"
            :disabled="busy"
          >
            {{ busy ? "Sending…" : "Send Request" }}
          </button>

          <button
            v-else-if="relation === 'PENDING_SENT'"
            class="btn-disabled"
            disabled
          >
            Request Sent
          </button>

          <div v-else-if="relation === 'PENDING_RECEIVED'" class="hint">
            This user sent you a request. Go to Matches to accept/decline.
          </div>

          <button
            v-else-if="relation === 'ACCEPTED'"
            class="btn-primary"
            @click="goMessage"
          >
            Message
          </button>

          <button
            v-else-if="relation === 'DECLINED'"
            class="btn-disabled"
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

// relation data from /matches (if exists for this id)
const relation = ref("NONE"); // 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'DECLINED'
const requestId = ref(null);
const threadId = ref(null);

const initial = computed(() =>
  (profile.value?.name || "?").charAt(0).toUpperCase()
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    // public profile
    const { data } = await api.get(`/room-finder/${id}/public`);
    profile.value = data;

    // matches (to know relation to me)
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
  // If we already know the thread, go directly; otherwise, create/resolve first
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
  background: #faffd6;
  min-height: 100vh;
  padding: 2rem;
  font-family: sans-serif;
}
.card {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 12px;
  padding: 1.25rem;
  max-width: 820px;
  margin: 0 auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}
.header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}
.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #e6fff1;
  color: #1b9536;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 1.1rem;
}
h1 {
  color: #0c4a23;
  margin: 0;
}
.sub {
  color: #555;
  margin: 0.25rem 0 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}
h3 {
  margin: 0 0 0.35rem;
  color: #0c4a23;
}
.muted {
  color: #666;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.btn-primary {
  background: #1b9536;
  color: #fff;
  border: 0;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.btn-disabled {
  background: #d9eadf;
  color: #398b53;
  border: 0;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: not-allowed;
}
.loading {
  color: #555;
}
.error {
  color: #c92a2a;
}
.hint {
  color: #555;
}
</style>
