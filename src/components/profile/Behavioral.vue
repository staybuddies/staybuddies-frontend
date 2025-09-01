<template>
  <div>
    <div v-if="loading" class="loading">Loading…</div>
    <div v-if="error" class="error">{{ error }}</div>

    <form v-if="!loading" @submit.prevent="saveBehavioral">
      <div class="grid">
        <label class="checkbox">
          <input type="checkbox" v-model="behavior.locationSharing" />
          Share my rough location with matches
        </label>

        <label class="checkbox">
          <input type="checkbox" v-model="behavior.emailNotification" />
          Email me important updates
        </label>
      </div>

      <button class="primary">Save Behavioral</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import api from "@/api";

const loading = ref(true);
const error = ref("");

const behavior = reactive({
  locationSharing: false,
  emailNotification: false,
});

onMounted(fetchBehavioral);

async function fetchBehavioral() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/room-finder/me");
    behavior.locationSharing = Boolean(data.locationSharing);
    behavior.emailNotification = Boolean(data.emailNotification);
  } catch (e) {
    console.error(e);
    error.value = "Could not load behavioral settings.";
  } finally {
    loading.value = false;
  }
}

async function saveBehavioral() {
  try {
    await api.put("/room-finder/me/behavioral", { ...behavior });
    alert("Behavioral saved.");
  } catch (e) {
    console.error(e);
    alert("Failed to save behavioral.");
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 0.6rem;
}
.checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #0c4a23;
}
.primary {
  margin-top: 0.25rem;
  padding: 0.8rem 1.2rem;
  background: #1b9536;
  color: #fff;
  border: 0;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.loading {
  color: #666;
}
.error {
  color: #c92a2a;
  margin-bottom: 0.35rem;
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
