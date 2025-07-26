// components/RoommateTabs.vue
<template>
  <section class="tabs-section">
    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'preferences' }" 
        @click="activeTab = 'preferences'">
        Roommate Preferences
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'analysis' }" 
        @click="activeTab = 'analysis'">
        Compatibility Analysis
      </button>
    </div>

    <div v-if="activeTab === 'preferences'" class="preferences">
      <h2>Roommate Type Preference</h2>
      <p>Your ideal roommate characteristics</p>
      <div class="preferences-columns">
        <div>
          <h3>Preferred Characteristics</h3>
          <ul>
            <li>Clean and organized</li>
            <li>Respects quiet hours</li>
            <li>Similar study habits</li>
            <li>Communicative about issues</li>
          </ul>
        </div>
        <div>
          <h3>Deal Breakers</h3>
          <ul>
            <li>Smokers</li>
            <li>Frequent loud parties</li>
            <li>Disrespect for personal space</li>
            <li>Poor communication</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'analysis'" class="analysis">
      <h2>Your Roommate Compatibility Profile</h2>
      <p>Based on your lifestyle and preferences, here’s what we’ve learned about your compatibility</p>
      <div class="preferences-columns">
        <div>
          <h3>Most Compatible With</h3>
          <ul>
            <li>Early risers with moderate noise levels</li>
            <li>Studious individuals with similar schedules</li>
            <li>People with similar cleanliness standards</li>
            <li>Moderately social individuals</li>
          </ul>
        </div>
        <div>
          <h3>Least Compatible With</h3>
          <ul>
            <li>Night owls who are active after 11PM</li>
            <li>Messy or disorganized individuals</li>
            <li>Frequently loud individuals</li>
            <li>Those who host parties frequently</li>
          </ul>
        </div>
      </div>
      <button class="btn-primary">View Your Matches</button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'RoommateTabs',
  data() {
    return {
      activeTab: 'preferences'
    }
  }
}
</script>

<style scoped>
.tabs-section {
  background: #faffd6;
  padding: 2rem;
  border-radius: 8px;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.tab {
  flex: 1;
  background: #e6fff1;
  color: #1b9536;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.tab.active {
  background: #1b9536;
  color: white;
}
.preferences, .analysis {
  background: #e6fff1;
  padding: 2rem;
  border-radius: 8px;
}
.preferences-columns {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.preferences-columns div {
  flex: 1;
  min-width: 200px;
}
.preferences-columns ul {
  list-style: disc;
  padding-left: 1.2rem;
}
.btn-primary {
  background: #1b9536;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1.5rem;
  font-weight: bold;
}
</style>
