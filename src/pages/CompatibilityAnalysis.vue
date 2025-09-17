<template>
  <div class="wrap">
    <div class="tabs">
      <button class="tab" @click="goPrefs">Roommate Preferences</button>
      <button class="tab active">Compatibility Analysis</button>
    </div>

    <section class="panel hero">
      <h1>Roommate Compatibility Profile</h1>

      <div class="chips">
        <span v-for="t in insights.profileTags || []" :key="t" class="chip">{{
          t
        }}</span>
      </div>

      <div class="stats">
        <article class="stat">
          <div class="big">{{ insights.averageCompatibility ?? 0 }}%</div>
          <div class="lbl">Average compatibility</div>
        </article>
        <article class="stat">
          <div class="big">{{ insights.bestCompatibility ?? 0 }}%</div>
          <div class="lbl">Best match</div>
        </article>
        <article class="stat">
          <div class="big">{{ insights.highCount ?? 0 }}</div>
          <div class="lbl">High matches (≥80%)</div>
        </article>
        <article class="stat">
          <div class="big">{{ insights.totalCompared ?? 0 }}</div>
          <div class="lbl">People compared</div>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>Compatibility Factors</h2>
      <p class="muted">
        How different factors affect your compatibility with others
      </p>

      <ul class="factors">
        <li v-for="f in factors" :key="f.key">
          <div class="row">
            <span class="name">{{ f.name }}</span>
            <span class="impact">{{ f.impact }}</span>
          </div>
          <div class="bar">
            <div class="fill" :style="{ width: f.fill + '%' }" />
            <div class="ghost" />
          </div>
        </li>
      </ul>
    </section>

    <section class="grid-2">
      <article class="panel">
        <h2>Most Compatible With</h2>
        <ul class="bullets positive">
          <li>Early risers with moderate noise levels</li>
          <li>Studious individuals with similar schedules</li>
          <li>People with similar cleanliness standards</li>
          <li>Moderately social individuals</li>
        </ul>
        <button class="btn primary" @click="goMatches">
          View your matches →
        </button>
      </article>

      <article class="panel">
        <h2>Least Compatible With</h2>
        <ul class="bullets negative">
          <li>Night owls who are active after 11PM</li>
          <li>Messy or disorganized individuals</li>
          <li>Frequently loud individuals</li>
          <li>Those who host parties frequently</li>
        </ul>
      </article>
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
  averageCompatibility: 0,
  bestCompatibility: 0,
  highCount: 0,
  totalCompared: 0,
});

const WEIGHTS = {
  "Sleep Schedule": 1.0,
  Cleanliness: 0.9,
  "Noise Tolerance": 0.7,
  "Social Habits": 0.7,
  "Study Habits": 0.6,
  "Budget Alignment": 0.4,
};

const factors = computed(() => {
  // Turn weights into bars with labels that mirror the mock
  const max = Math.max(...Object.values(WEIGHTS));
  return Object.entries(WEIGHTS).map(([name, w], i) => {
    const pct = Math.round((w / max) * 100);
    const impact =
      w >= 0.9 ? "High Impact" : w >= 0.6 ? "Medium Impact" : "Low Impact";
    return { key: i, name, fill: pct, impact };
  });
});

async function load() {
  try {
    const { data } = await api.get("/quiz/insights");
    insights.value = data || insights.value;
  } catch (e) {
    // keep UI – silent fail
    console.warn("insights load failed", e);
  }
}

function goPrefs() {
  router.push({ name: "preferences" });
}
function goMatches() {
  router.push({ name: "matches" });
}

onMounted(load);
</script>

<style scoped>
/* Theme */
:root {
  --g: #1b9536;
  --g2: #0b5e1f;
  --ink: #0c4a23;
  --mut: #667085;
  --bg: #f6fffa;
}
.wrap {
  background: #fff;
  padding: 1rem clamp(8px, 2vw, 16px) 2rem;
}

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

.panel {
  background: #f4fff7;
  border: 1px solid #cbe8d2;
  border-radius: 16px;
  padding: 1.1rem;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
}
.panel + .panel {
  margin-top: 1rem;
}
.panel.hero {
  background: #eefd f5;
  background: linear-gradient(180deg, #f1fff7 0%, #ffffff 100%);
}

h1 {
  margin: 0 0 0.6rem;
  color: var(--ink);
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  font-weight: 1000;
}
h2 {
  margin: 0 0 0.4rem;
  color: var(--ink);
  font-weight: 900;
  font-size: 1.15rem;
}
.muted {
  color: var(--mut);
  margin: 0 0 0.5rem;
}

.chips {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin: 0.6rem 0 1rem;
}
.chip {
  background: #e6fff1;
  color: var(--g2);
  border: 1px solid #b8f1ce;
  padding: 0.38rem 0.8rem;
  border-radius: 999px;
  font-weight: 800;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}
.stat {
  background: #fffdf1;
  border: 1px solid #f4f0c9;
  border-radius: 14px;
  padding: 0.9rem;
  text-align: center;
}
.stat .big {
  font-size: clamp(1.4rem, 3.6vw, 2.2rem);
  font-weight: 1000;
  color: var(--g2);
  line-height: 1;
}
.stat .lbl {
  color: #365143;
  margin-top: 0.3rem;
  font-weight: 700;
}

.factors {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0;
  display: grid;
  gap: 0.8rem;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}
.name {
  color: var(--ink);
  font-weight: 800;
}
.impact {
  color: #9a8f2a;
  font-weight: 800;
  font-size: 0.92rem;
  white-space: nowrap;
}
.bar {
  position: relative;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: #fafbe8;
  border: 1px solid #efe9b9;
}
.fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 60%;
  background: #0f0f0f;
}
.ghost {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 180, 0.35) 40%,
    transparent 80%
  );
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
  margin-top: 1rem;
}
.bullets {
  margin: 0.35rem 0 0.8rem 1.1rem;
}
.bullets li {
  margin: 0.35rem 0;
}
.positive li {
  color: #0c4a23;
}
.negative li {
  color: #9b1c1c;
}
.btn {
  border-radius: 12px;
  padding: 0.65rem 1rem;
  font-weight: 900;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn.primary {
  background: var(--g);
  color: #fff;
  border-color: var(--g);
}

@media (max-width: 900px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
