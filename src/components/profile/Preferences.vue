<template>
  <div>
    <div v-if="loading" class="loading">Loading…</div>
    <div v-if="error" class="error">{{ error }}</div>

    <form v-if="!loading" @submit.prevent="savePrefs">
      <div class="grid">
        <label>
          Gender
          <select v-model="prefs.gender">
            <option value="">—</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>
        <label
          >Age
          <input v-model.number="prefs.age" type="number" min="16" max="99"
        /></label>
        <label>University <input v-model.trim="prefs.university" /></label>
        <label>Location <input v-model.trim="prefs.location" /></label>
      </div>
      <button class="primary">Save Preferences</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import api from "@/api";

const loading = ref(true);
const error = ref("");
const prefs = reactive({ gender: "", age: null, university: "", location: "" });

onMounted(fetch);

async function fetch() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/room-finder/me");
    prefs.gender = data.gender ?? "";
    prefs.age = data.age ?? null;
    prefs.university = data.university ?? "";
    prefs.location = data.location ?? "";
  } catch (e) {
    error.value = "Could not load preferences.";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function savePrefs() {
  try {
    const { data } = await api.put("/room-finder/me/preferences", { ...prefs });
    Object.assign(prefs, data);
    alert("Preferences saved.");
  } catch (e) {
    alert("Failed to save preferences");
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
label {
  display: flex;
  flex-direction: column;
  font-weight: 700;
  color: #0c4a23;
}
input,
select {
  margin-top: 0.35rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid #1b9536;
  border-radius: 6px;
  font-family: inherit;
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
