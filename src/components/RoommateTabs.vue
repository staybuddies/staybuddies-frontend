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
.tabs {
  margin-top: 1rem;
}
.tab-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.tab {
  background: #eaf9e8;
  color: #197a33;
  padding: 12px 16px;
  border: 2px solid #197a33;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.tab.active {
  background: #1b9536;
  color: #fff;
}

.panel {
  background: #e6fff1;
  border-radius: 12px;
  padding: 20px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
h2 {
  margin: 0 0 8px;
  color: #1b9536;
}
h3 {
  color: #1b9536;
  margin-top: 16px;
}
ul {
  margin: 8px 0 0 16px;
}
.ideal {
  margin-top: 16px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 16px;
}
.chip {
  background: #d4ff87;
  color: #1b9536;
  border-radius: 9999px;
  padding: 6px 12px;
  font-weight: 600;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
}
.stat {
  background: #faffd6;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.stat-number {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1b9536;
}
.stat-label {
  color: #3e6c43;
  font-size: 0.9rem;
}
.hint {
  color: #666;
  margin-top: 10px;
}
@media (max-width: 960px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
