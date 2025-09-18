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

      <div class="cols">
        <!-- Preferred -->
        <div class="col">
          <h3>Preferred Characteristics</h3>
          <ul
            v-if="(insights.preferredCharacteristics || []).length"
            class="bullets bullets--good"
          >
            <li
              v-for="(t, i) in insights.preferredCharacteristics"
              :key="'p-' + i"
            >
              {{ t }}
            </li>
          </ul>
          <p v-else class="muted">
            • No data yet — finish your quiz to see this.
          </p>
        </div>

        <!-- Deal Breakers -->
        <div class="col">
          <h3>Deal Breakers</h3>
          <ul
            v-if="(insights.dealBreakers || []).length"
            class="bullets bullets--bad"
          >
            <li v-for="(t, i) in insights.dealBreakers" :key="'d-' + i">
              {{ t }}
            </li>
          </ul>
          <p v-else class="muted">• None detected from your quiz answers.</p>
        </div>
      </div>

      <!-- soft divider -->
      <div class="rule"></div>

      <!-- Ideal traits block -->
      <div class="ideal-block">
        <h3>Ideal Roommate Characteristics</h3>
        <ul
          v-if="(insights.idealTraits || []).length"
          class="bullets bullets--neutral"
        >
          <li v-for="(t, i) in insights.idealTraits" :key="'i-' + i">
            {{ t }}
          </li>
        </ul>
        <p v-else class="muted">• You haven’t unlocked this yet.</p>
      </div>
    </section>

    <!-- COMPAT TAB -->
    <section v-if="!loading && tab === 'compat'" class="card compat">
      <h2>Compatibility Analysis</h2>

      <div v-if="(insights.profileTags || []).length" class="tags">
        <span
          class="tag"
          v-for="(t, i) in insights.profileTags"
          :key="'tag-' + i"
          >{{ t }}</span
        >
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
import { reactive, ref, onMounted } from "vue";
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

onMounted(fetchInsights);

async function fetchInsights() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/quiz/insights");
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
:root {
}

/* Layout wrapper */
.wrap {
  margin-top: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
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
  border-radius: 12px;
  padding: 0.78rem 1rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.05s;
}
.tab:active {
  transform: translateY(1px);
}
.tab.active {
  background: #1b9536;
  color: #fff;
}

/* Cards */
.card {
  background: white;
  border: 1px solid #b8f1ce;
  border-radius: 14px;
  padding: 1rem 1rem 1.2rem;
}
.card.compat {
  background-color: white; /* White box for the entire card */
  padding: 1rem; /* Add spacing inside the card */
  border: 1px solid #b8f1ce; /* Light border for definition */
  border-radius: 14px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  min-height: 220px; /* Ensure consistent height */
}

.card.compat h2 {
  background-color: #e2efe6; /* Slightly different background for the header */
  padding: 20px; /* Add spacing inside the header */
  border: 1px solid #ddd; /* Light border for the header */
  border-radius: 2px; /* Rounded corners for the header */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin: 0 0 1rem; /* Add spacing below the header */
}

.card.prefs {
  background-color: white; /* White box for the entire card */
  padding: 1rem; /* Add spacing inside the card */
  border: 1px solid #b8f1ce; /* Light border for definition */
  border-radius: 14px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  min-height: 220px; /* Ensure consistent height */
}

.card.prefs h2 {
  background-color: #e2efe6; /* Slightly different background for the header */
  padding: 20px; /* Add spacing inside the header */
  border: 1px solid #ddd; /* Light border for the header */
  border-radius: 2px; /* Rounded corners for the header */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin: 0 0 1rem; /* Add spacing below the header */
}

.card h2 {
  color: #176d2b;
  margin: 0 0 0.4rem;
}
.headline-sub {
  margin-top: 0.1rem;
}

.muted {
  color: #4d6a57;
}
.small {
  font-size: 0.9rem;
}

/* Two columns area */
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 0.75rem;
}
.col h3 {
  color: #1b7a34;
  margin: 0 0 0.4rem;
}

/* Bullets (custom markers) */
.bullets {
  list-style: none;
  margin: 0.35rem 0 0;
  padding: 0;
}
.bullets li {
  position: relative;
  padding-left: 1.15rem;
  line-height: 1.5;
  color: #0b4120;
  margin: 0.34rem 0;
}
.bullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.58rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a; /* default = good */
}
/* green dots for Preferred */
.bullets--good li::before {
  background: #16a34a;
}
/* red dots for Deal Breakers */
.bullets--bad li::before {
  background: #e53935;
}
/* solid black dots for Ideal block (your request) */
.bullets--neutral li::before {
  background: #111;
}

/* Divider line */
.rule {
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.06),
    rgba(0, 0, 0, 0.04)
  );
  margin: 1rem 0 0.75rem;
  border-radius: 1px;
}

/* Ideal block heading */
.ideal-block h3 {
  color: #1b7a34;
  margin: 0 0 0.4rem;
}

/* Compatibility tab */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.25rem 0 0.85rem;
}
.tag {
  background: #e6fff1;
  border: 1px solid #b8f1ce;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-weight: 800;
  color: #1b7a34;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
.box {
  background: #fff;
  border: 1px dashed #b8f1ce;
  border-radius: 12px;
  padding: 0.85rem;
}
.label {
  color: #4d6a57;
  font-size: 0.9rem;
}
.val {
  color: #1b9536;
  font-weight: 900;
  font-size: 1.4rem;
  margin-top: 0.15rem;
}

.error {
  color: #c92a2a;
}

/* Responsive */
@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
