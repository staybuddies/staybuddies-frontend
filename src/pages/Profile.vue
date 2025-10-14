<template>
  <div>
    <Navbar />
    <section class="profile">
      <div class="header">
        <h1>Profile</h1>
        <p class="intro">Manage your personal information and preferences</p>
      </div>

      <div class="tabs-container">
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
      </div>

      <div class="content">
        <component :is="currentTab" />
      </div>
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

.header {
  margin-bottom: 1.5rem;
}

h1 {
  color: #1b9536;
  margin: 0;
  font-size: 2rem;
}

.intro {
  color: #0c4a23;
  margin: 0.5rem 0 0;
  font-size: 1rem;
}

.tabs-container {
  margin-bottom: 2rem;
  position: relative;
}

.tabs {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #bfe7cc #f4fff7;
  padding-bottom: 0.5rem;
}

.tabs::-webkit-scrollbar {
  height: 6px;
}

.tabs::-webkit-scrollbar-track {
  background: #f4fff7;
  border-radius: 3px;
}

.tabs::-webkit-scrollbar-thumb {
  background: #bfe7cc;
  border-radius: 3px;
}

.tabs::-webkit-scrollbar-thumb:hover {
  background: #9fd9b5;
}

.tabs button {
  background: #e6fff1;
  color: #1b9536;
  border: 0;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.tabs button:hover {
  background: #d0f5e0;
}

.tabs button.active {
  background: #1b9536;
  color: #fff;
  box-shadow: 0 2px 8px rgba(27, 149, 54, 0.3);
}

.content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tablet styles */
@media (max-width: 1024px) {
  .profile {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .intro {
    font-size: 0.95rem;
  }

  .tabs button {
    padding: 0.55rem 1.1rem;
    font-size: 0.9rem;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }

  .header {
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .intro {
    font-size: 0.9rem;
  }

  .tabs-container {
    margin-left: -1rem;
    margin-right: -1rem;
    padding: 0 1rem;
    margin-bottom: 1.5rem;
  }

  .tabs {
    gap: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .tabs button {
    padding: 0.55rem 1rem;
    font-size: 0.88rem;
    border-radius: 6px;
  }
}

/* Small mobile styles */
@media (max-width: 480px) {
  .profile {
    padding: 0.75rem;
  }

  h1 {
    font-size: 1.3rem;
  }

  .intro {
    font-size: 0.85rem;
    margin-top: 0.35rem;
  }

  .tabs-container {
    margin-left: -0.75rem;
    margin-right: -0.75rem;
    padding: 0 0.75rem;
  }

  .tabs {
    gap: 0.5rem;
  }

  .tabs button {
    padding: 0.5rem 0.85rem;
    font-size: 0.85rem;
  }
}
</style>
