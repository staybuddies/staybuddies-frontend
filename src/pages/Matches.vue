<template>
  <div>
    <Navbar />
    <section class="matches">
      <div class="header-row">
        <div>
          <h1>Your Matches</h1>
          <p class="intro">
            We've found potential roommates based on your quiz and profile.
          </p>
        </div>

        <div class="actions">
          <details class="filter">
            <summary class="filter-btn-secondary">
              Filter: {{ filterLabel }}
            </summary>
            <div class="filter-menu">
              <button class="filter-item" @click="setThreshold(null)">
                All
              </button>
              <button
                class="filter-item"
                v-for="t in thresholds"
                :key="t"
                @click="setThreshold(t)"
              >
                {{ t }}%+
              </button>
            </div>
          </details>
          <button class="filter-btn-secondary" @click="toggleSort">
            {{ sortDesc ? "Sort: Best → Worst" : "Sort: Worst → Best" }}
          </button>
          <button class="filter-btn-secondary" @click="reload">Reload</button>
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
const sortDesc = ref(true);
const thresholds = [95, 90, 80, 70, 60];
const filterThreshold = ref(null); // null = All

const filterLabel = computed(() =>
  filterThreshold.value == null ? "All" : `${filterThreshold.value}%+`
);

function setThreshold(t) {
  filterThreshold.value = t;
}
// start with best → worst

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/matches");

    // accept several possible server shapes
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.matches)
      ? data.matches
      : [];

    // normalize each item so MatchCard never crashes
    matches.value = arr.map((m) => ({
      userId: Number(m.userId ?? m.id ?? 0),
      name: m.name ?? "Roommate",
      age: m.age ?? null,
      gender: m.gender ?? "",
      location: m.location ?? "",
      compatibility: Number(m.compatibility ?? m.score ?? 0),
      relationStatus: m.relationStatus ?? "NONE",
      requestId: m.requestId ?? null,
      // accept a few common keys:
      photoUrl:
        m.photoUrl ?? m.photo ?? m.avatarUrl ?? m.profilePhotoUrl ?? null,
    }));
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

const filteredMatches = computed(() => {
  const t = filterThreshold.value;
  if (t == null) return matches.value;
  return matches.value.filter((m) => (m.compatibility ?? 0) >= t);
});

const sortedMatches = computed(() => {
  const arr = [...filteredMatches.value];
  arr.sort((a, b) =>
    sortDesc.value
      ? (b.compatibility ?? 0) - (a.compatibility ?? 0)
      : (a.compatibility ?? 0) - (b.compatibility ?? 0)
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
  background: #ffffff;
  padding: 2rem;
  min-height: 100vh;
  font-family: sans-serif;
  padding-top: 15px;
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
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  align-items: stretch;
}

.loading {
  color: #555;
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
}

.error {
  color: #c92a2a;
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
  background: #ffe0e0;
  border-radius: 8px;
  border: 1px solid #ffa8a8;
}

.empty {
  color: #666;
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
}

/* Filter Buttons - Matches Page Specific */
.filter-btn-secondary {
  background: white;
  color: #1b9536;
  border: 2px solid #1b9536;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  font-size: inherit;
  transition: background-color 0.2s ease;
}

.filter-btn-secondary:hover:not(:disabled) {
  background: #eafbf0;
}

.filter-btn-secondary:focus {
  outline: 2px solid #1b9536;
  outline-offset: 2px;
}

/* Filter dropdown */
.filter {
  position: relative;
}

.filter > summary {
  list-style: none;
  cursor: pointer;
}

.filter > summary::-webkit-details-marker {
  display: none;
}

.filter[open] > summary {
  background: #eafbf0;
}

.filter-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 160px;
  background: #fff;
  border: 2px solid #1b9536;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 6px;
  z-index: 5;
}

.filter-item {
  width: 100%;
  text-align: left;
  background: #fff;
  border: 0;
  padding: 8px 10px;
  border-radius: 8px;
  font-weight: 800;
  color: #1b9536;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  transition: background-color 0.2s ease;
}

.filter-item:hover {
  background: #eafbf0;
}

.filter-item:focus {
  background: #eafbf0;
  outline: 2px solid #1b9536;
  outline-offset: -2px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .matches {
    padding: 1rem;
  }

  .header-row {
    flex-direction: column;
    align-items: start;
    gap: 1.5rem;
  }

  .actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-btn-secondary {
    flex: 1;
    min-width: 120px;
  }

  .cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .matches {
    padding: 0.5rem;
  }

  .matches h1 {
    font-size: 1.75rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-btn-secondary {
    width: 100%;
  }

  .filter-menu {
    left: 0;
    right: 0;
    width: auto;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .filter-btn-secondary,
  .filter-item {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .filter-btn-secondary {
    border-width: 3px;
  }

  .error {
    border-width: 2px;
  }
}
</style>
