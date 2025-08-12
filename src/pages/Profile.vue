<template>
  <div>
    <Navbar />
    <section class="profile">
      <h1>Profile</h1>
      <p class="intro">Manage your personal information and preferences</p>

      <div class="tabs">
        <button :class="{ active: tab === 'info' }" @click="tab = 'info'">
          Personal Info
        </button>
        <button
          :class="{ active: tab === 'preferences' }"
          @click="tab = 'preferences'"
        >
          Preferences
        </button>
        <button
          :class="{ active: tab === 'behavior' }"
          @click="tab = 'behavior'"
        >
          Behavioral Tracking
        </button>
      </div>

      <div v-if="loading" class="loading">Loading…</div>
      <div v-if="error" class="error">{{ error }}</div>

      <form v-if="!loading && tab === 'info'" @submit.prevent="savePersonal">
        <div class="grid">
          <label>Full Name <input v-model.trim="form.name" required /></label>
          <label
            >Email <input v-model.trim="form.email" type="email" disabled
          /></label>
          <label>Phone <input v-model.trim="form.phone" required /></label>
          <label
            >Gender
            <select v-model="form.gender">
              <option value="">—</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <label
            >Age
            <input v-model.number="form.age" type="number" min="16" max="99"
          /></label>
          <label>Location <input v-model.trim="form.location" /></label>
          <label>University <input v-model.trim="form.university" /></label>
          <label class="checkbox">
            <input type="checkbox" v-model="form.alreadyHasRoom" />
            Already have a room
          </label>
          <label
            >Change Password (optional)
            <input
              v-model="password"
              type="password"
              placeholder="New password"
            />
          </label>
        </div>
        <button class="primary">Save Changes</button>
      </form>

      <form
        v-if="!loading && tab === 'preferences'"
        @submit.prevent="savePrefs"
      >
        <div class="grid">
          <label
            >Gender
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

      <form
        v-if="!loading && tab === 'behavior'"
        @submit.prevent="saveBehavioral"
      >
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
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import api from "@/api";
import Navbar from "@/components/Navbar.vue";

const tab = ref("info");
const loading = ref(true);
const error = ref("");

const form = reactive({
  id: null,
  name: "",
  email: "",
  phone: "",
  gender: "",
  age: null,
  location: "",
  university: "",
  alreadyHasRoom: false,
});
const password = ref("");

const prefs = reactive({
  gender: "",
  age: null,
  university: "",
  location: "",
});

const behavior = reactive({
  locationSharing: false,
  emailNotification: false,
});

onMounted(fetchProfile);

async function fetchProfile() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/room-finder/me");
    Object.assign(form, data);
    // init prefs/behavior from profile
    prefs.gender = data.gender ?? "";
    prefs.age = data.age ?? null;
    prefs.university = data.university ?? "";
    prefs.location = data.location ?? "";
    behavior.locationSharing = data.locationSharing ?? false;
    behavior.emailNotification = data.emailNotification ?? false;
  } catch (e) {
    error.value = "Could not load profile.";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function savePersonal() {
  try {
    await api.put("/room-finder/me", {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      age: form.age,
      location: form.location,
      university: form.university,
      alreadyHasRoom: form.alreadyHasRoom,
      password: password.value || null, // only updates if non-empty on server
    });
    password.value = "";
    await fetchProfile();
    alert("Saved.");
  } catch (e) {
    alert("Failed to save profile");
    console.error(e);
  }
}

async function savePrefs() {
  try {
    const { data } = await api.put("/room-finder/me/preferences", { ...prefs });
    // reflect back
    Object.assign(prefs, data);
    await fetchProfile();
    alert("Preferences saved.");
  } catch (e) {
    alert("Failed to save preferences");
  }
}

async function saveBehavioral() {
  try {
    const { data } = await api.put("/room-finder/me/behavioral", {
      ...behavior,
    });
    Object.assign(behavior, data);
    await fetchProfile();
    alert("Behavioral saved.");
  } catch (e) {
    alert("Failed to save behavioral");
  }
}
</script>

<style scoped>
.profile {
  background: #faffd6;
  padding: 2rem;
  min-height: 100vh;
}
h1 {
  color: #1b9536;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin: 1rem 0 2rem;
}
.tabs button {
  background: #e6fff1;
  color: #1b9536;
  border: 0;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.tabs button.active {
  background: #1b9536;
  color: #fff;
}
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
}
.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
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
  margin-bottom: 1rem;
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
