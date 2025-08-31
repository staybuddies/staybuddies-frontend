<template>
  <div>
    <div v-if="loading" class="loading">Loading…</div>
    <div v-if="error" class="error">{{ error }}</div>

    <form v-if="!loading" @submit.prevent="saveBehavioral">
      <div class="grid">
        <label class="checkbox">
          <input type="checkbox" v-model="behavior.locationSharing" /> Share my
          rough location with matches
        </label>
        <label class="checkbox">
          <input type="checkbox" v-model="behavior.emailNotification" /> Email
          me important updates
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
const behavior = reactive({ locationSharing: false, emailNotification: false });

onMounted(fetch);

async function fetch() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/room-finder/me");
    behavior.locationSharing = data.locationSharing ?? false;
    behavior.emailNotification = data.emailNotification ?? false;
  } catch (e) {
    error.value = "Could not load behavioral settings.";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function saveBehavioral() {
  try {
    await api.put("/room-finder/me/behavioral", { ...behavior });
    alert("Behavioral saved.");
  } catch (e) {
    alert("Failed to save behavioral");
    console.error(e);
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #0c4a23;
}
.primary {
  margin-top: 1rem;
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
  margin-bottom: 0.25rem;
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
