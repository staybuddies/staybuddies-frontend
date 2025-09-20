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
        <button :class="{ active: tab === 'idv' }" @click="tab = 'idv'">
          ID Verification
        </button>
      </div>

      <component :is="currentTab" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Navbar from "@/components/Navbar.vue";

import PersonalInfo from "@/components/profile/PersonalInfo.vue";
import Preferences from "@/components/profile/Preferences.vue";
import Behavioral from "@/components/profile/Behavioral.vue";
import IdVerification from "@/components/profile/IdVerification.vue";

const tab = ref("info");
const tabs = {
  info: PersonalInfo,
  preferences: Preferences,
  behavior: Behavioral,
  idv: IdVerification,
};
const currentTab = computed(() => tabs[tab.value]);
</script>

<style scoped>
.profile {
  background: #ffffff;
  padding: 2rem;
  min-height: 100vh;
}
h1 {
  color: #1b9536;
}
.intro {
  color: #0c4a23;
  margin-top: 0.25rem;
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
</style>
