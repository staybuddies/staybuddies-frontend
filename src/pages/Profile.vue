<template>
  <div>
    <Navbar />
    <section class="profile">
      <h1>Profile</h1>
      <p class="intro">Manage your personal information and preferences</p>

      <div class="tabs">
        <button
          :class="{ active: activeTab === 'info' }"
          @click="activeTab = 'info'"
        >Personal Info</button>

        <button
          :class="{ active: activeTab === 'preferences' }"
          @click="activeTab = 'preferences'"
        >Preferences</button>

        <button
          :class="{ active: activeTab === 'behavior' }"
          @click="activeTab = 'behavior'"
        >Behavioral Tracking</button>
      </div>

      <div v-if="loading" class="loading">Loading…</div>
      <div v-if="error" class="error">{{ error }}</div>

      <!-- PERSONAL INFO -->
      <PersonalInfo
        v-if="!loading && activeTab === 'info'"
        :initialProfile="profile"
        @save="savePersonalInfo"
      />

      <!-- PREFERENCES -->
      <Preferences
        v-if="!loading && activeTab === 'preferences'"
        :initialPreferences="profile.preferences"
        @save="savePreferences"
      />

      <!-- BEHAVIORAL TRACKING -->
      <BehavioralTracking
        v-if="!loading && activeTab === 'behavior'"
        :initialTracking="profile.behavioralTracking"
        @save="saveBehavioral"
      />
    </section>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import PersonalInfo from '@/components/PersonalInfo.vue'
import Preferences from '@/components/Preferences.vue'
import BehavioralTracking from '@/components/BehavioralTracking.vue'
import api from '@/api'

export default {
  name: 'Profile',
  components: { Navbar, PersonalInfo, Preferences, BehavioralTracking },

  data() {
    return {
      activeTab: 'info',
      profile: null,
      loading: true,
      error: null,
    }
  },

  created() {
    this.fetchProfile()
  },

  methods: {
    async fetchProfile() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/roomfinder/me')
        this.profile = data
      } catch (e) {
        this.error = 'Could not load profile.'
      } finally {
        this.loading = false
      }
    },

    // PERSONAL INFO
    async savePersonalInfo(updatedProfile) {
      try {
        await api.put('/roomfinder/me', updatedProfile)
        this.profile = { ...this.profile, ...updatedProfile }
        alert('Personal info saved')
      } catch (_) {
        alert('Failed to save personal info')
      }
    },

    // PREFERENCES
    async savePreferences(newPrefs) {
      try {
        const { data } = await api.put('/roomfinder/me/preferences', newPrefs)
        this.profile.preferences = data
        alert('Preferences saved')
      } catch (_) {
        alert('Failed to save preferences')
      }
    },

    // BEHAVIORAL TRACKING
    async saveBehavioral(newBehavioral) {
      try {
        const { data } = await api.put('/roomfinder/me/behavioral', newBehavioral)
        this.profile.behavioralTracking = data
        alert('Behavioral tracking saved')
      } catch (_) {
        alert('Failed to save behavioral tracking')
      }
    },
  },
}
</script>

<style scoped>
.profile {
  background: #faffd6;
  padding: 2rem;
  min-height: 100vh;
  font-family: sans-serif;
}
h1 { color: #1b9536; font-size: 2rem; margin-bottom: .5rem; }
.intro { color: #444; margin-bottom: 1.5rem; }

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.tabs button {
  background: #e6fff1;
  color: #1b9536;
  border: none;
  padding: .5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.tabs button.active {
  background: #1b9536;
  color: white;
}

.loading {
  font-size: 1rem;
  color: #666;
}
.error {
  color: red;
  margin-bottom: 1rem;
}
</style>
