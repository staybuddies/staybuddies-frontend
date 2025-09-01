<template>
  <div class="insights-card">
    <!-- Tabs header lives outside if you already have it; this is just the body -->
    <section class="pref-block">
      <h2>Roommate Type Preference</h2>
      <p class="muted">Your ideal roommate characteristics</p>

      <div class="pref-grid">
        <div>
          <h3>Preferred Characteristics</h3>
          <ul v-if="data.preferredCharacteristics?.length">
            <li v-for="(t, i) in data.preferredCharacteristics" :key="i">
              {{ t }}
            </li>
          </ul>
          <p v-else class="muted">
            No data yet — finish your quiz to see this.
          </p>
        </div>

        <div>
          <h3>Deal Breakers</h3>
          <ul v-if="data.dealBreakers?.length">
            <li v-for="(t, i) in data.dealBreakers" :key="i">{{ t }}</li>
          </ul>
          <p v-else class="muted">
            No data yet — finish your quiz to see this.
          </p>
        </div>
      </div>
    </section>

    <section class="compat-block">
      <h2>Compatibility Analysis</h2>

      <div v-if="loading" class="muted">Loading…</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="stats">
        <div class="stat">
          <div class="label">Average Match</div>
          <div class="value">{{ data.averageCompatibility }}%</div>
        </div>
        <div class="stat">
          <div class="label">Best Match</div>
          <div class="value">{{ data.bestCompatibility }}%</div>
        </div>
        <div class="stat">
          <div class="label">High Matches (≥80%)</div>
          <div class="value">{{ data.highCount }}</div>
        </div>
        <div class="stat">
          <div class="label">People Compared</div>
          <div class="value">{{ data.totalCompared }}</div>
        </div>
      </div>

      <div class="tags" v-if="data.profileTags?.length">
        <span class="tag" v-for="(t, i) in data.profileTags" :key="i">{{
          t
        }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import api from "@/api";

const loading = ref(true);
const error = ref("");
const data = reactive({
  idealTraits: [],
  preferredCharacteristics: [],
  dealBreakers: [],
  profileTags: [],
  averageCompatibility: 0,
  bestCompatibility: 0,
  highCount: 0,
  totalCompared: 0,
});

onMounted(fetchInsights);

async function fetchInsights() {
  loading.value = true;
  error.value = "";
  try {
    const { data: res } = await api.get("/quiz/insights");
    Object.assign(data, res || {});
  } catch (e) {
    console.error(e);
    error.value = "Could not load insights.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.insights-card {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 10px;
  padding: 1rem;
}

.pref-block,
.compat-block {
  background: #eafff0;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
}

h2 {
  color: #0c4a23;
  margin: 0 0 0.3rem;
}

h3 {
  color: #14823a;
  margin: 0.25rem 0 0.5rem;
}

.muted {
  color: #666;
}
.error {
  color: #c92a2a;
}

.pref-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.pref-grid ul {
  padding-left: 1.1rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.4rem;
}

.stat {
  background: #f7fff0;
  border: 1px dashed #b8f1ce;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
}
.stat .label {
  font-size: 0.9rem;
  color: #3e7c52;
}
.stat .value {
  font-size: 1.4rem;
  font-weight: 900;
  color: #0c4a23;
}

.tags {
  margin-top: 0.6rem;
}
.tag {
  display: inline-block;
  margin: 0.2rem 0.25rem 0 0;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid #b8f1ce;
  background: #e6fff1;
  color: #1b9536;
  font-weight: 800;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .pref-grid {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
