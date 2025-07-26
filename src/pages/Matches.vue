<template>
  <div><Navbar /></div>
  <section class="matches">
    

    <h1>Your Matches</h1>
    <p class="intro">
      We’ve found potential roommates based on your behavior patterns and preferences.
    </p>

    <div class="actions">
      <button class="btn-secondary">Filter</button>
      <button class="btn-primary">Sort by Compatibility</button>
    </div>

    <div class="cards">
      <MatchCard
        initial="A"
        name="Alex Johnson"
        :age="21"
        gender="Male"
        location="ABC Bangna"
        :compatibility="92"
        budget="฿6000 - 7500 / month"
        about="Engineering student who enjoys hiking on weekends. I’m clean, quiet, and respectful of shared spaces."
        :lifestyle="['Early Riser', 'Clean', 'Studious']"
        :reasons="[
          'Similar electricity usage patterns',
          'Compatible sleep schedules',
          'Both prefer moderate temperatures'
        ]"
        actionLabel="Send Request"
      />
      <MatchCard
        initial="J"
        name="Jamie Smith"
        :age="22"
        gender="Female"
        location="ABC Huamak"
        :compatibility="84"
        budget="฿6500 - 7000 / month"
        about="Psychology major who loves reading and occasional Netflix binges. I enjoy time to myself but am always up for a good conversation."
        :lifestyle="['Organized', 'Quiet', 'Bookworm Cook']"
        :reasons="[
          'Similar noise preferences',
          'Compatible room occupancy patterns',
          'Both energy-conscious'
        ]"
        actionLabel="Message"
      />
    </div>

    
  </section>
</template>

<script>
import Navbar from '../components/Navbar.vue'

import MatchCard from '../components/MatchCard.vue'

export default {
  name: 'Matches',
  components: {
    Navbar,
    MatchCard
  }
}
</script>

<style scoped>
.matches {
  background: #faffd6;
  padding: 2rem;
  min-height: 100vh;
  font-family: sans-serif;
}
.matches h1 {
  color: #1b9536;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.intro {
  color: #444;
  margin-bottom: 2rem;
}
.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}
.btn-primary {
  background: #1b9536;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-secondary {
  background: white;
  color: #1b9536;
  border: 2px solid #1b9536;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
</style>
