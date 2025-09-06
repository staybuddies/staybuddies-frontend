<template>
  <div>
    <Navbar />

    <section class="matches">
      <div class="header-row">
        <div>
          <h1>Your Matches</h1>
          <p class="intro">
            We’ve found potential roommates based on your quiz and profile.
          </p>
        </div>

        <div class="actions">
          <button class="btn-secondary" @click="toggleSort">
            {{ sortDesc ? "Sort: Best → Worst" : "Sort: Worst → Best" }}
          </button>
          <button class="btn-secondary" @click="reload">Reload</button>
        </div>
      </div>

      <div v-if="loading" class="loading">Loading matches…</div>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="!loading && !error && matches.length === 0" class="empty">
        No matches yet. Take the lifestyle quiz first!
      </div>

      <div class="cards" v-if="!loading && !error">
        <MatchCard
          v-for="m in sortedMatches"
          :key="m.userId"
          :match="m"
          @send="sendRequest(m.userId)"
          @accept="accept(m.requestId)"
          @decline="decline(m.requestId)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Navbar from "@/components/Navbar.vue";
import MatchCard from "@/components/MatchCard.vue";
import api from "@/api"; // axios instance that adds the Authorization header

const matches = ref([]);
const loading = ref(false);
const error = ref("");
const sortDesc = ref(true); // start with best → worst

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/matches");
    matches.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    error.value = "Failed to load matches.";
  } finally {
    loading.value = false;
  }
}

function toggleSort() {
  sortDesc.value = !sortDesc.value;
}

const sortedMatches = computed(() => {
  const arr = [...matches.value];
  arr.sort((a, b) =>
    sortDesc.value
      ? b.compatibility - a.compatibility
      : a.compatibility - b.compatibility
  );
  return arr;
});

async function sendRequest(targetId) {
  try {
    const { data } = await api.post(`/matches/${targetId}/request`);
    // update the row
    const idx = matches.value.findIndex((m) => m.userId === targetId);
    if (idx >= 0) {
      matches.value[idx] = {
        ...matches.value[idx],
        relationStatus: "PENDING_SENT",
        requestId: data.requestId,
      };
    }
  } catch (e) {
    console.error(e);
    alert("Could not send request.");
  }
}

async function accept(requestId) {
  try {
    await api.post(`/matches/${requestId}/accept`);
    // find the card with this requestId
    const idx = matches.value.findIndex((m) => m.requestId === requestId);
    if (idx >= 0) {
      matches.value[idx] = {
        ...matches.value[idx],
        relationStatus: "ACCEPTED",
      };
    }
  } catch (e) {
    console.error(e);
    alert("Could not accept request.");
  }
}

async function decline(requestId) {
  try {
    await api.post(`/matches/${requestId}/decline`);
    const idx = matches.value.findIndex((m) => m.requestId === requestId);
    if (idx >= 0) {
      matches.value[idx] = {
        ...matches.value[idx],
        relationStatus: "DECLINED",
      };
    }
  } catch (e) {
    console.error(e);
    alert("Could not decline request.");
  }
}

function reload() {
  load();
}

onMounted(load);
</script>

<style scoped>
.matches {
  background: #faffd6;
  padding: 2rem;
  min-height: 100vh;
  font-family: sans-serif;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.matches h1 {
  color: #1b9536;
  font-size: 2rem;
  margin-bottom: 0.25rem;
}
.intro {
  color: #444;
}
.actions {
  display: flex;
  gap: 0.75rem;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.btn-secondary {
  background: white;
  color: #1b9536;
  border: 2px solid #1b9536;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.loading {
  color: #555;
}
.error {
  color: #c92a2a;
}
.empty {
  color: #666;
}
</style>
