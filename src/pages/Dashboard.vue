<!-- Dashboard.vue -->
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
          <!-- Avatar links to the same profile route -->
          <router-link
            class="avatar clickable"
            :to="{
              name: 'roomfinder-public',
              params: { id: String(m.userId) },
            }"
            title="View profile"
          >
            {{ firstLetter(m.name) }}
          </router-link>

          <!-- Name/info block links to the same profile route -->
          <router-link
            class="info info-link"
            :to="{
              name: 'roomfinder-public',
              params: { id: String(m.userId) },
            }"
            title="View profile"
          >
            <strong class="name-link">{{ m.name }}</strong>
            <span class="percent">{{ m.compatibility }}% match</span>
            <small v-if="m.location">· {{ m.location }}</small>
          </router-link>

          <span
            class="status"
            :class="{
              matched: m.relationStatus === 'ACCEPTED',
              pending: m.relationStatus?.startsWith('PENDING'),
            }"
          >
            {{ getStatusLabel(m) }}
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

      <!-- Keep your tabs -->
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

function viewAllMatches() {
  try {
    router.push({ name: "matches" });
  } catch {
    router.push("/matches");
  }
}

/* Use a distinct name to avoid any shadowing */
function getStatusLabel(m) {
  const s = m?.relationStatus;
  if (s === "ACCEPTED") return "Matched";
  if (s === "PENDING_SENT") return "Pending";
  if (s === "PENDING_RECEIVED") return "Needs your response";
  if (s === "DECLINED") return "Declined";
  return "Not connected";
}

/* ---------- lifecycle ---------- */
onMounted(refresh);
</script>

<style scoped>
/* --- Palette & base (vanilla CSS vars) --- */
.dashboard {
  --bg: #fbfde9;
  --card: #fff;
  --card-bd: #e9f3ea;
  --text: #0c4a23;
  --muted: #6b7a72;
  --brand: #1b9536;
  --brand-600: #147a2c;
  --brand-50: #eafbf0;

  --ok-bg: #e8fdd5;
  --ok-bd: #c9f3a2;
  --ok-fg: #18794e;
  --warn-bg: #fff4cc;
  --warn-bd: #ffe29a;
  --warn-fg: #8a6a00;
  --pill-bg: #f2f5f3;
  --pill-bd: #e1e9e3;
  --pill-fg: #66707a;

  background: var(--bg);
  padding: clamp(1rem, 2.5vw, 2rem);
  min-height: 100vh;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
h1 {
  color: var(--brand-600);
  font-weight: 900;
  letter-spacing: -0.02em;
  font-size: clamp(1.8rem, 2.6vw, 2.2rem);
  margin: 0 0 0.25rem;
}
.welcome {
  margin: 0 0 1.25rem;
  color: #3e5149;
}

/* --- Card --- */
.recent-matches {
  background: var(--card);
  border: 1px solid var(--card-bd);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(28, 96, 56, 0.06);
}
.recent-matches h2 {
  color: var(--text);
  font-size: clamp(1.1rem, 1.6vw, 1.25rem);
  margin: 0;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}
.empty {
  color: #6b7a72;
  background: #f7fbf8;
  border: 1px dashed #d8e6dd;
  padding: 0.9rem 1rem;
  border-radius: 10px;
}

/* --- Items --- */
.match-card {
  display: grid;
  grid-template-columns: 48px 1fr auto auto;
  gap: 14px;
  align-items: center;
  padding: 0.85rem 0;
  border-top: 1px solid #edf3ee;
  transition: background 0.2s ease, transform 0.08s ease, padding 0.2s ease;
}
.match-card:first-of-type {
  border-top: 1px solid transparent;
}
.match-card:hover {
  background: var(--brand-50);
  transform: translateY(-1px);
  border-radius: 12px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* Avatar (now a link) */
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--brand-600);
  background: radial-gradient(100% 100% at 0% 0%, #f3ffe5 0%, #d4ff87 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06) inset;
  text-decoration: none;
}

/* Info (now a link) */
.info {
  min-width: 0;
}
.info-link {
  display: block;
  text-decoration: none;
  cursor: pointer;
  color: inherit;
}
.info-link:focus {
  outline: 2px solid var(--brand-600);
  outline-offset: 2px;
  border-radius: 6px;
}
.info strong {
  display: block;
  color: var(--text);
  font-weight: 850;
  line-height: 1.1;
}
.name-link {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.percent {
  font-size: 0.9rem;
  color: var(--brand-600);
  opacity: 0.9;
  font-weight: 700;
}

/* Status pill */
.status {
  padding: 0.28rem 0.7rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.85rem;
  border: 1px solid var(--pill-bd);
  background: var(--pill-bg);
  color: var(--pill-fg);
  white-space: nowrap;
}
.status.matched {
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}
.status.pending {
  background: var(--warn-bg);
  border-color: var(--warn-bd);
  color: var(--warn-fg);
}

/* Actions & buttons */
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.pill-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-primary,
.btn-secondary,
.btn-ghost {
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-weight: 800;
  border: 1px solid transparent;
  transition: transform 0.06s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.btn-primary {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}
.btn-primary:hover {
  filter: brightness(1.05);
  box-shadow: 0 8px 20px rgba(27, 149, 54, 0.2);
  transform: translateY(-1px);
}
.btn-secondary {
  background: #fff;
  color: var(--brand-600);
  border-color: var(--brand-600);
}
.btn-secondary:hover {
  background: var(--brand-50);
}
.btn-secondary::after {
  content: " →";
  font-weight: 900;
}
.btn-ghost {
  background: transparent;
  color: var(--brand-600);
  border-color: var(--brand-600);
}
.btn-ghost:hover {
  background: var(--brand-50);
}
.btn-link {
  background: transparent;
  color: var(--brand-600);
  border: 0;
  text-decoration: none;
  font-weight: 800;
}
.btn-link:hover {
  text-decoration: underline;
}

.loading {
  color: #6b7a72;
}
.error {
  color: #c92a2a;
}

/* --- Responsive --- */
@media (max-width: 720px) {
  .match-card {
    grid-template-columns: 40px 1fr auto;
    gap: 10px;
  }
  .actions {
    grid-column: 2 / -1;
    justify-self: end;
  }
  .percent {
    display: block;
    margin-top: 0.15rem;
  }
}
</style>
