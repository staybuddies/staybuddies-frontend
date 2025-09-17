<template>
  <div class="wrap">
    <div class="tabs">
      <button class="tab active">Roommate Preferences</button>
      <button class="tab" @click="goAnalysis">Compatibility Analysis</button>
    </div>

    <section class="grid3">
      <!-- Noise -->
      <article class="card">
        <header class="head">
          <h3>Noise Preferences</h3>
          <p class="muted">Your noise tolerance and preferences</p>
        </header>

        <div class="noise">
          <div class="icon">🎵</div>
          <div>
            <div class="level">{{ noiseLevel.label }}</div>
            <small class="muted">Your noise tolerance level</small>
          </div>
        </div>

        <dl class="rows">
          <dt>During day</dt>
          <dd>{{ noiseLevel.day }}</dd>
          <dt>During night</dt>
          <dd>{{ noiseLevel.night }}</dd>
          <dt>Quiet hours</dt>
          <dd>{{ noiseLevel.quietHours }}</dd>
        </dl>
      </article>

      <!-- Lifestyle -->
      <article class="card">
        <header class="head">
          <h3>Lifestyle Preferences</h3>
          <p class="muted">Your preferences for roommate habits</p>
        </header>

        <ul class="tags">
          <li>
            <span>Smoking</span>
            <em :class="pill(noSmokingLabel).cls">{{ noSmokingLabel }}</em>
          </li>
          <li>
            <span>Pets</span>
            <em class="pill">Some pets okay</em>
          </li>
          <li>
            <span>Drinking</span>
            <em class="pill">Social only</em>
          </li>
          <li>
            <span>Overnight guests</span>
            <em class="pill">Occasionally okay</em>
          </li>
        </ul>
      </article>

      <!-- Budget & Location -->
      <article class="card">
        <header class="head">
          <h3>Budget & Location</h3>
          <p class="muted">Your housing preferences</p>
        </header>

        <dl class="rows">
          <dt>Budget Range</dt>
          <dd class="bold">{{ budgetTag }}</dd>

          <dt>Preferred Location</dt>
          <dd class="bold">{{ preferredLocation }}</dd>

          <dt>Max Distance from Campus</dt>
          <dd class="bold">{{ maxDistance }}</dd>
        </dl>
      </article>
    </section>

    <!-- Type Preference -->
    <section class="panel">
      <h2>Roommate Type Preference</h2>
      <p class="muted">Your ideal roommate characteristics</p>

      <div class="cols">
        <div>
          <h4>Preferred Characteristics</h4>
          <ul class="bullets green">
            <li
              v-for="(t, i) in insights.preferredCharacteristics || []"
              :key="'p' + i"
            >
              {{ t }}
            </li>
          </ul>
        </div>
        <div>
          <h4>Deal Breakers</h4>
          <ul class="bullets red">
            <li v-for="(t, i) in insights.dealBreakers || []" :key="'d' + i">
              {{ t }}
            </li>
          </ul>
        </div>
      </div>

      <h4 class="mt">Ideal Roommate Characteristics</h4>
      <ul class="bullets">
        <li>Keeps a tidy, organized space</li>
        <li>Communicates issues openly</li>
        <li>Respects personal space</li>
        <li>{{ budgetTag }}</li>
        <li>{{ regionTag }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();
const insights = ref({
  profileTags: [],
  preferredCharacteristics: [],
  dealBreakers: [],
});

function goAnalysis() {
  router.push({ name: "compatibility" });
}

function firstTag(prefix) {
  return (insights.value.profileTags || []).find((t) => t.startsWith(prefix));
}

/* ---------- derived fields from profileTags ---------- */
const budgetTag = computed(() => firstTag("Budget:") || "Budget: unspecified");
const regionTag = computed(() => firstTag("Region:") || "Region: unspecified");

const noSmokingLabel = computed(() => {
  // If both “Great communicator” etc. appear but no smoking tag, show “Not acceptable”
  return "Not acceptable";
});

// Noise heuristics from tags (Early bird / Night owl / Noise tolerant)
const noiseLevel = computed(() => {
  const tags = insights.value.profileTags || [];
  const very = tags.some((t) => /Very noise tolerant/i.test(t));
  const moderate = tags.some((t) => /Moderate noise tolerance/i.test(t));
  const early = tags.some((t) => /Early bird/i.test(t));
  const night = tags.some((t) => /Night owl/i.test(t));

  const label = very ? "High" : moderate ? "Moderate" : "Low";
  const day = very
    ? "Lively ok"
    : moderate
    ? "Moderate noise acceptable"
    : "Prefer quiet";
  const nightTxt = early
    ? "Quiet preferred"
    : night
    ? "Late activity ok"
    : "Quiet preferred";
  const quietHours = early ? "10PM – 6AM" : night ? "12AM – 8AM" : "10PM – 8AM";

  return { label, day, night: nightTxt, quietHours };
});

const preferredLocation = "University District";
const maxDistance = "5 miles";

/* ---------- UI helpers ---------- */
function pill(label) {
  return {
    cls: label === "Not acceptable" ? "pill danger" : "pill",
  };
}

/* ---------- load ---------- */
async function load() {
  try {
    const { data } = await api.get("/quiz/insights");
    insights.value = data || insights.value;
  } catch (e) {
    console.warn("load prefs failed", e);
  }
}

onMounted(load);
</script>

<style scoped>
:root {
  --g: #1b9536;
  --g2: #0b5e1f;
  --ink: #0c4a23;
  --mut: #667085;
}
.wrap {
  padding: 1rem clamp(8px, 2vw, 16px) 2rem;
  background: #fff;
}

/* Tabs */
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 0.25rem 0 1rem;
}
.tab {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 2px solid var(--g);
  background: #eafaf0;
  color: var(--g2);
  font-weight: 900;
}
.tab.active {
  background: var(--g);
  color: #fff;
  border-color: var(--g);
}

/* Cards grid */
.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.card {
  background: #f4fff7;
  border: 1px solid #cbe8d2;
  border-radius: 16px;
  padding: 1.1rem;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
}
.head h3 {
  margin: 0;
  color: var(--ink);
  font-weight: 900;
}
.muted {
  color: var(--mut);
  margin: 0.15rem 0 0;
}

/* Noise box */
.noise {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0.6rem 0 0.35rem;
}
.icon {
  font-size: 28px;
}
.level {
  font-size: 1.15rem;
  font-weight: 900;
  color: var(--g2);
}
.rows {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 0.45rem 0.8rem;
  margin: 0.6rem 0 0;
}
.rows dt {
  color: #365143;
  font-weight: 800;
}
.rows dd {
  margin: 0;
}

/* Lifestyle tags */
.tags {
  list-style: none;
  margin: 0.4rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}
.tags li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}
.tags li > span {
  font-weight: 800;
  color: #365143;
}
.pill {
  background: #e6fff1;
  border: 1px solid #b8f1ce;
  color: #0b5e1f;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  font-weight: 800;
}
.pill.danger {
  background: #ffeaea;
  border-color: #ffc6c6;
  color: #9b1c1c;
}

/* Type preference panel */
.panel {
  margin-top: 1rem;
  background: #effcf4;
  border: 1px solid #cbe8d2;
  border-radius: 16px;
  padding: 1rem;
}
h2 {
  margin: 0 0 0.25rem;
  color: var(--ink);
  font-weight: 1000;
}
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 0.3rem 0 0.6rem;
}
h4 {
  margin: 0.2rem 0 0.35rem;
  color: var(--ink);
  font-weight: 900;
}
.bullets {
  margin: 0.1rem 0 0 0.9rem;
}
.bullets li {
  margin: 0.28rem 0;
}
.bullets.green li {
  color: #0c4a23;
}
.bullets.red li {
  color: #9b1c1c;
}
.bold {
  font-weight: 900;
  color: var(--ink);
}
.mt {
  margin-top: 0.5rem;
}

@media (max-width: 1050px) {
  .grid3 {
    grid-template-columns: 1fr;
  }
  .cols {
    grid-template-columns: 1fr;
  }
}
</style>
