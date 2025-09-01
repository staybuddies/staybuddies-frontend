<template>
  <div class="wrap">
    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: tab === 'prefs' }"
        @click="tab = 'prefs'"
      >
        Roommate Preferences
      </button>
      <button
        class="tab"
        :class="{ active: tab === 'compat' }"
        @click="tab = 'compat'"
      >
        Compatibility Analysis
      </button>
    </div>

    <!-- Loading / Error -->
    <p v-if="loading" class="muted">Loading…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <!-- PREFS TAB -->
    <section v-if="!loading && tab === 'prefs'" class="card prefs">
      <h2>Roommate Type Preference</h2>
      <p class="muted">Your ideal roommate characteristics</p>

      <div class="cols">
        <div class="col">
          <h3>Preferred Characteristics</h3>
          <ul class="bullets" v-if="hasAny">
            <li
              v-for="(t, i) in insights.preferredCharacteristics"
              :key="'p-' + i"
            >
              {{ t }}
            </li>
            <li v-for="(t, i) in insights.idealTraits" :key="'i-' + i">
              {{ t }}
            </li>
          </ul>
          <p class="muted" v-else>
            • No data yet — finish your quiz to see this.
          </p>
        </div>

        <div class="col">
          <h3>Deal Breakers</h3>
          <ul class="bullets" v-if="(insights.dealBreakers || []).length">
            <li v-for="(t, i) in insights.dealBreakers" :key="'d-' + i">
              {{ t }}
            </li>
          </ul>
          <p class="muted" v-else>• None detected from your quiz answers.</p>
        </div>
      </div>
    </section>

    <!-- COMPAT TAB -->
    <section v-if="!loading && tab === 'compat'" class="card compat">
      <h2>Compatibility Analysis</h2>

      <div class="tags" v-if="(insights.profileTags || []).length">
        <span
          class="tag"
          v-for="(t, i) in insights.profileTags"
          :key="'tag-' + i"
        >
          {{ t }}
        </span>
      </div>

      <div class="stats">
        <div class="box">
          <div class="label">Average vs others</div>
          <div class="val">{{ insights.averageCompatibility }}%</div>
        </div>
        <div class="box">
          <div class="label">Best match</div>
          <div class="val">{{ insights.bestCompatibility }}%</div>
        </div>
        <div class="box">
          <div class="label">High compatibility</div>
          <div class="val">
            {{ insights.highCount }} / {{ insights.totalCompared }}
          </div>
        </div>
      </div>

      <p class="muted small">
        We computed these numbers from your quiz answers compared with other
        users who have finished the quiz.
      </p>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import api from "@/api";

const tab = ref("prefs");
const loading = ref(true);
const error = ref("");

const insights = reactive({
  idealTraits: [],
  preferredCharacteristics: [],
  dealBreakers: [],
  profileTags: [],
  averageCompatibility: 0,
  bestCompatibility: 0,
  highCount: 0,
  totalCompared: 0,
});

const hasAny = computed(() => {
  return (
    (insights.preferredCharacteristics?.length || 0) > 0 ||
    (insights.idealTraits?.length || 0) > 0
  );
});

onMounted(fetchInsights);

async function fetchInsights() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/quiz/insights");
    // defensive defaults
    Object.assign(insights, {
      idealTraits: data.idealTraits ?? [],
      preferredCharacteristics: data.preferredCharacteristics ?? [],
      dealBreakers: data.dealBreakers ?? [],
      profileTags: data.profileTags ?? [],
      averageCompatibility: data.averageCompatibility ?? 0,
      bestCompatibility: data.bestCompatibility ?? 0,
      highCount: data.highCount ?? 0,
      totalCompared: data.totalCompared ?? 0,
    });
  } catch (e) {
    console.error(e);
    error.value = "Could not load quiz insights. Finish your quiz first?";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.wrap {
  margin-top: 0.5rem;
}

/* Tabs */
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.tab {
  appearance: none;
  border: 1px solid #1b9536;
  background: #eefaf1;
  color: #176d2b;
  font-weight: 900;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  cursor: pointer;
}
.tab.active {
  background: #1b9536;
  color: #fff;
}

/* Cards */
.card {
  background: #ecfff5;
  border: 1px solid #b8f1ce;
  border-radius: 12px;
  padding: 1rem 1rem 1.1rem;
}
.card h2 {
  color: #176d2b;
  margin: 0 0 0.75rem 0;
}
.muted {
  color: #4d6a57;
}
.small {
  font-size: 0.9rem;
}

.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-top: 0.75rem;
}
.col h3 {
  color: #1b7a34;
  margin-top: 0.25rem;
}
.bullets {
  margin: 0.35rem 0 0;
  padding-left: 1.1rem;
}
.bullets li {
  margin: 0.2rem 0;
}

/* compat */
.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}
.tag {
  background: #e6fff1;
  border: 1px solid #b8f1ce;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-weight: 800;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
.box {
  background: #fff;
  border: 1px dashed #b8f1ce;
  border-radius: 10px;
  padding: 0.75rem;
}
.label {
  color: #4d6a57;
  font-size: 0.9rem;
}
.val {
  font-weight: 900;
  font-size: 1.4rem;
  color: #1b9536;
  margin-top: 0.2rem;
}

.error {
  color: #c92a2a;
}

@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
