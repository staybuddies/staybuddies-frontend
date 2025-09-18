<template>
  <div class="tabs">
    <div class="tab-header">
      <button
        :class="['tab', active === 'prefs' ? 'active' : '']"
        @click="active = 'prefs'"
      >
        Roommate Preferences
      </button>
      <button
        :class="['tab', active === 'compat' ? 'active' : '']"
        @click="active = 'compat'"
      >
        Compatibility Analysis
      </button>
    </div>

    <div class="panel" v-if="active === 'prefs'">
      <h2>Roommate Type Preference</h2>
      <p>Your ideal roommate characteristics</p>

      <div class="grid">
        <div>
          <h3>Preferred Characteristics</h3>
          <ul>
            <li
              v-for="it in insights?.preferredCharacteristics || []"
              :key="'p-' + it"
            >
              {{ it }}
            </li>
            <li v-if="!insights && !loading">
              No data yet — finish your quiz to see this.
            </li>
          </ul>
        </div>
        <div>
          <h3>Deal Breakers</h3>
          <ul>
            <li v-for="it in insights?.dealBreakers || []" :key="'d-' + it">
              {{ it }}
            </li>
          </ul>
        </div>
      </div>

      <div class="ideal" v-if="insights?.idealTraits?.length">
        <h3>Ideal Roommate Characteristics</h3>
        <ul>
          <li v-for="it in insights.idealTraits" :key="'i-' + it">{{ it }}</li>
        </ul>
      </div>
    </div>

    <div class="panel" v-else>
      <h2>Roommate Compatibility Profile</h2>

      <div class="chips">
        <span v-for="t in insights?.profileTags || []" :key="t" class="chip">{{
          t
        }}</span>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-number">
            {{ insights?.averageCompatibility ?? 0 }}%
          </div>
          <div class="stat-label">Average compatibility</div>
        </div>
        <div class="stat">
          <div class="stat-number">{{ insights?.bestCompatibility ?? 0 }}%</div>
          <div class="stat-label">Best match</div>
        </div>
        <div class="stat">
          <div class="stat-number">{{ insights?.highCount ?? 0 }}</div>
          <div class="stat-label">High matches (≥80%)</div>
        </div>
        <div class="stat">
          <div class="stat-number">{{ insights?.totalCompared ?? 0 }}</div>
          <div class="stat-label">People compared</div>
        </div>
      </div>

      <div v-if="!loading && !insights" class="hint">
        Take the roommate quiz to unlock compatibility insights.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";

const active = ref("prefs");
const loading = ref(false);
const insights = ref(null);

async function load() {
  try {
    loading.value = true;
    const { data } = await api.get("/quiz/insights");
    insights.value = data;
  } catch (e) {
    // If user hasn't taken quiz yet or endpoint not present, just keep panels blank
    insights.value = null;
    console.warn(e);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
/* ===============================
   Vanilla CSS for your tabs/panel
   =============================== */
.tabs {
  --text: #0c4a23;
  --muted: #6b7a72;
  --brand: #1b9536;
  --brand-600: #0f5132;
  --track: #f5fcf7;
  --track-bd: #cfe9d6;

  --panel-bg: #fff;
  --panel-head: #eafbf0;
  --panel-bd: #dcebe2;

  --chip-bg: #e6fff1;
  --chip-bd: #b8f1ce;
  --chip-fg: #1b9536;

  --tile-bg: #faffd6;
  --tile-bd: #e8efb8;
  --tile-fg: #1b9536;

  margin-top: 1rem;
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

/* ========== Segmented tab header (CSS-only slider) ========== */
.tab-header {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: var(--track);
  border: 1px solid var(--track-bd);
  border-radius: 14px;
  padding: 4px;
  overflow: hidden;
}

/* Buttons */
.tab {
  position: relative;
  z-index: 1; /* above slider */
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-weight: 850;
  color: #1b5e39;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.06s ease;
}
.tab:hover {
  transform: translateY(-1px);
}
.tab:focus-visible {
  outline: 2px solid #9fe5b6;
  outline-offset: 2px;
}

/* Fallback active (when :has isn’t supported) */
.tab.active {
  background: var(--brand);
  color: #fff;
}

/* Sliding highlight (modern browsers) */
@supports selector(:has(*)) {
  .tab-header::after {
    content: "";
    position: absolute;
    inset: 4px auto 4px 4px; /* top/right/bottom/left */
    width: calc(50% - 8px);
    border-radius: 10px;
    background: var(--brand);
    box-shadow: 0 6px 16px rgba(27, 149, 54, 0.18) inset,
      0 2px 6px rgba(0, 0, 0, 0.05);
    transform: translateX(0%);
    transition: transform 0.25s ease;
    pointer-events: none;
  }
  .tab-header:has(.tab:nth-child(2).active)::after {
    transform: translateX(100%);
  }
  /* When slider shows, don’t paint the active button bg too */
  .tab.active {
    background: transparent;
    color: #fff;
  }
}

/* ========== Panel with header band and divider ========== */
.panel {
  --head-h: 80px; /* adjust if your title wraps */
  position: relative;
  margin-top: 1rem;
  background: var(--panel-bg);
  border: 1px solid var(--panel-bd);
  border-radius: 12px;
  padding: calc(var(--head-h) + 16px) 18px 18px; /* room for header band */
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(28, 96, 56, 0.04);
}

/* Pale green header */
.panel::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: var(--head-h);
  background: var(--panel-head);
}
/* Thin divider below header */
.panel::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: var(--head-h);
  height: 1px;
  background: #e2efe6;
}

/* Title + subtitle sit inside the band */
.panel > h2 {
  position: absolute;
  left: 18px;
  top: 14px;
  margin: 0;
  color: var(--brand-600);
  font-weight: 900;
  letter-spacing: -0.01em;
}
.panel > p {
  position: absolute;
  left: 18px;
  top: 50px;
  margin: 0;
  color: #4a6b58;
  font-size: 0.95rem;
}

/* ========== Two-column content area ========== */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-top: 6px; /* space under the divider */
}
@media (max-width: 960px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* Column headings */
.grid h3 {
  margin: 0 0 8px;
  color: #176a3b;
  font-weight: 800;
}

/* Lists with colored dots */
.grid ul {
  margin: 0;
  padding: 0;
}
.grid li {
  list-style: none;
  position: relative;
  padding-left: 16px;
  margin: 10px 0;
  line-height: 1.5;
  color: var(--text);
}
.grid li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981; /* green dots */
}
/* Right column (Deal Breakers) = red dots */
.grid > div:nth-child(2) li::before {
  background: #ef4444;
}

/* Optional section below the grid */
.ideal {
  margin-top: 16px; /* space before the section */
  padding-top: 14px; /* space after the line */
  border-top: 1px solid var(--panel-bd, #e2efe6); /* soft, dim line */
}

.ideal h3 {
  margin: 0 0 8px;
  color: #176a3b;
  font-weight: 800;
}

.ideal ul {
  margin: 0;
  padding: 0;
}

.ideal li {
  list-style: none;
  position: relative;
  padding-left: 16px;
  margin: 10px 0;
  line-height: 1.5;
  color: var(--text);
}

/* black bullet */
.ideal li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #000; /* <- black */
}

/* ========== Chips (used on compatibility panel) ========== */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.35rem 0 1rem;
}
.chip {
  display: inline-block;
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  background: var(--chip-bg);
  border: 1px solid var(--chip-bd);
  color: var(--chip-fg);
  font-weight: 800;
  font-size: 0.92rem;
}

/* ========== Stats tiles (compatibility panel) ========== */
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px;
}
@media (max-width: 960px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
.stat {
  background: var(--tile-bg);
  border: 1px solid var(--tile-bd);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
  transition: transform 0.08s ease, box-shadow 0.2s ease;
}
.stat:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.06);
}
.stat-number {
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  font-weight: 900;
  color: var(--tile-fg);
  letter-spacing: -0.01em;
}
.stat-label {
  color: #3e6c43;
  font-size: 0.92rem;
  margin-top: 0.15rem;
}

/* Small hint text */
.hint {
  color: #667085;
  margin-top: 0.8rem;
}
</style>
