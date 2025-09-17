<template>
  <div>
    <Navbar />
    <section class="dashboard">
      <h1>Dashboard</h1>
      <p class="welcome">
        Welcome back! Here's an overview of your roommate matching journey.
      </p>

      <div class="recent-matches">
        <div class="row">
          <h2>Recent Matches</h2>
          <button class="btn-link" @click="refresh" :disabled="loading">
            {{ loading ? "Refreshing…" : "Refresh" }}
          </button>
        </div>
        <p>Your most recent potential roommate matches</p>

        <div v-if="!loading && !matches.length" class="empty">
          No matches yet. Try completing more of your profile or the quiz!
        </div>

        <div v-for="m in topFive" :key="m.userId" class="match-card">
          <div class="avatar">{{ firstLetter(m.name) }}</div>

          <div class="info">
            <strong>{{ m.name }}</strong>
            <span class="percent">{{ m.compatibility }}% match</span>
            <small v-if="m.location">· {{ m.location }}</small>
          </div>

          <span
            class="status"
            :class="{
              matched: m.relationStatus === 'ACCEPTED',
              pending: m.relationStatus?.startsWith('PENDING'),
            }"
          >
            {{ statusLabel(m) }}
          </span>

          <div class="actions">
            <!-- NONE -->
            <button
              v-if="m.relationStatus === 'NONE'"
              class="btn-primary"
              @click="sendRequest(m)"
              :disabled="busyId === m.userId"
              title="Send match request"
            >
              {{ busyId === m.userId ? "Sending…" : "Request" }}
            </button>

            <!-- PENDING_SENT -->
            <button
              v-else-if="m.relationStatus === 'PENDING_SENT'"
              class="btn-secondary"
              disabled
              title="Waiting for the other user"
            >
              Pending
            </button>

            <!-- PENDING_RECEIVED -->
            <div
              v-else-if="m.relationStatus === 'PENDING_RECEIVED'"
              class="pill-actions"
            >
              <button
                class="btn-primary"
                @click="accept(m)"
                :disabled="busyId === m.userId"
              >
                {{ busyId === m.userId ? "Accepting…" : "Accept" }}
              </button>
              <button
                class="btn-ghost"
                @click="decline(m)"
                :disabled="busyId === m.userId"
              >
                {{ busyId === m.userId ? "Declining…" : "Decline" }}
              </button>
            </div>

            <!-- ACCEPTED -->
            <button
              v-else-if="m.relationStatus === 'ACCEPTED'"
              class="btn-primary"
              @click="message(m)"
              :disabled="busyId === m.userId"
            >
              {{ busyId === m.userId ? "Opening…" : "Message" }}
            </button>
          </div>
        </div>

        <button class="btn-secondary" @click="viewAllMatches">
          View All Matches
        </button>
      </div>
      <!-- You can keep your extra tabs -->
      <RoommateTabs />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import RoommateTabs from "@/components/RoommateTabs.vue";
import api from "@/api";

const router = useRouter();

const loading = ref(false);
const busyId = ref(null);
const matches = ref([]); // List<MatchDto>

/* ---------- fetchers ---------- */
async function fetchMatches() {
  const { data } = await api.get("/matches");
  matches.value = Array.isArray(data) ? data : [];
}

async function refresh() {
  loading.value = true;
  try {
    await fetchMatches();
  } finally {
    loading.value = false;
  }
}

/* ---------- actions ---------- */
async function sendRequest(m) {
  if (!m?.userId) return;
  busyId.value = m.userId;
  try {
    const { data } = await api.post(`/matches/${m.userId}/request`);
    m.relationStatus = "PENDING_SENT";
    m.requestId = data?.requestId ?? m.requestId;
  } catch (e) {
    console.error(e);
    alert("Could not send request.");
  } finally {
    busyId.value = null;
  }
}

async function accept(m) {
  if (!m?.requestId) return;
  busyId.value = m.userId;
  try {
    await api.post(`/matches/requests/${m.requestId}/accept`);
    await fetchMatches(); // refresh to capture threadId/status
  } catch (e) {
    console.error(e);
    alert("Could not accept request.");
  } finally {
    busyId.value = null;
  }
}

async function decline(m) {
  if (!m?.requestId) return;
  busyId.value = m.userId;
  try {
    await api.post(`/matches/requests/${m.requestId}/decline`);
    m.relationStatus = "DECLINED";
  } catch (e) {
    console.error(e);
    alert("Could not decline request.");
  } finally {
    busyId.value = null;
  }
}

async function message(m) {
  if (!m?.userId) return;
  busyId.value = m.userId;
  try {
    let threadId = m.threadId;
    if (!threadId) {
      const { data } = await api.post(`/messages/thread-with/${m.userId}`);
      threadId = data?.threadId;
    }
    if (threadId) {
      router.push({ path: "/messages", query: { thread: String(threadId) } });
    } else {
      router.push({ path: "/messages", query: { with: String(m.userId) } });
    }
  } catch (e) {
    console.error(e);
    alert("Could not open messages.");
  } finally {
    busyId.value = null;
  }
}

/* ---------- helpers ---------- */
const topFive = computed(() =>
  [...matches.value]
    .sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
    .slice(0, 5)
);

function firstLetter(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function statusLabel(m) {
  switch (m?.relationStatus) {
    case "ACCEPTED":
      return "Matched";
    case "PENDING_SENT":
      return "Pending";
    case "PENDING_RECEIVED":
      return "Needs your response";
    case "DECLINED":
      return "Declined";
    default:
      return "Not connected";
  }
}
/* ---------- lifecycle ---------- */
onMounted(refresh);
</script>

<style scoped>
.dashboard {
  background: #faffd6;
  padding: 2rem;
  font-family: sans-serif;
  min-height: 100vh;
}
h1 {
  color: #1b9536;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.welcome {
  margin-bottom: 2rem;
  color: #444;
}

/* Recent matches */
.recent-matches {
  background: #e6fff1;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}
.recent-matches h2 {
  margin-bottom: 0.5rem;
  color: #1b9536;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.match-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;
}
.avatar {
  background: #d4ff87;
  color: #1b9536;
  font-weight: bold;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info {
  flex: 1;
  min-width: 0;
}
.info strong {
  color: #1b9536;
  display: block;
}
.percent {
  font-size: 0.85rem;
  color: #1b9536;
  margin-right: 6px;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
}
.status.pending {
  background: #fff8c4;
  color: #8f7400;
}
.status.matched {
  background: #d4ff87;
  color: #1b9536;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.pill-actions {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: #1b9536;
  color: white;
  padding: 0.45rem 0.9rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-secondary {
  background: #1b9536;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}
.btn-ghost {
  background: transparent;
  color: #1b9536;
  border: 1px solid #1b9536;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-link {
  background: transparent;
  color: #1b9536;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}
.empty {
  color: #666;
  padding: 0.75rem 0;
}
</style>
