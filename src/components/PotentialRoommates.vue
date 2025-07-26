<template>
  <section class="roommates" id="roommates">
    <p class="label">Active Users</p>
    <h2 class="heading">Meet Potential Roommates</h2>
    <p class="subtext">
      Browse through our community of students looking for their perfect roommate match.
    </p>
    <div class="cards">
      <RoommateCard initial="A" name="Alex Johnson" age="21" desc="Engineering student who enjoys hiking on weekends." tags="Early Riser,Clean,Studious" />
      <RoommateCard initial="J" name="Jamie Smith" age="22" desc="Psychology major who loves reading and occasional Netflix binges." tags="Quiet,Organized,Cook" />
      <RoommateCard initial="T" name="Taylor William" age="20" desc="Art student who enjoys painting and photography." tags="Creative,Tidy,Social" />
      <RoommateCard initial="J" name="Jorden Lee" age="23" desc="Business major and track athlete. Up early for training." tags="Athletic,Neat,Early Sleeper" />
    </div>
  </section>
</template>

<script>
import RoommateCard from './RoommateCard.vue'
export default {
  components: { RoommateCard }
}
</script>

<style scoped>
.roommates {
  background-color: #ffffff;
  text-align: center;
  padding: 4rem 1rem;
}
.label {
  display: inline-block;
  background: #d4ff87;
  color: #1b9536;
  font-weight: bold;
  padding: 0.25rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.heading {
  font-size: 2rem;
  font-weight: 800;
  color: #1b9536;
  margin-bottom: 0.5rem;
}
.subtext {
  max-width: 700px;
  margin: 0 auto 2rem;
  color: #444;
  font-size: 1rem;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
}
</style>