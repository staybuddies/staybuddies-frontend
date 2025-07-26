<template>
  <div class="match-card">
    <div class="header">
      <div class="avatar">{{ initial }}</div>
      <div>
        <strong>{{ name }}</strong>
        <p>{{ age }} • {{ gender }} • {{ location }}</p>
      </div>
      <span class="percent">{{ compatibility }}%</span>
    </div>
    <div class="content">
      <p class="label">Compatibility</p>
      <div class="progress-bar">
        <div class="progress" :style="{ width: compatibility + '%' }"></div>
      </div>
      <p class="section-title">Budget Range</p>
      <p>{{ budget }}</p>
      <p class="section-title">About</p>
      <p>{{ about }}</p>
      <p class="section-title">Lifestyle</p>
      <div class="tags">
        <span v-for="tag in lifestyle" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <p class="section-title">Why You Match</p>
      <ul>
        <li v-for="reason in reasons" :key="reason">{{ reason }}</li>
      </ul>
      <div class="buttons">
        <button class="btn-secondary">View Profile</button>
        <button class="btn-primary">{{ actionLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatchCard',
  props: {
    initial: String,
    name: String,
    age: Number,
    gender: String,
    location: String,
    compatibility: Number,
    budget: String,
    about: String,
    lifestyle: Array,
    reasons: Array,
    actionLabel: String
  }
}
</script>

<style scoped>
.match-card {
  background: #ffffff;
  border: 1px solid #1b9536;
  border-radius: 8px;
  padding: 1.5rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.avatar {
  background: #d4ff87;
  color: #1b9536;
  font-weight: bold;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.header strong {
  color: #1b9536;
  display: block;
}
.percent {
  background: #d4ff87;
  color: #1b9536;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
}
.label {
  color: #1b9536;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.progress-bar {
  background: #eee;
  border-radius: 6px;
  height: 16px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.progress {
  background: #1b9536;
  height: 100%;
}
.section-title {
  color: #1b9536;
  font-weight: 600;
  margin-top: 1rem;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.tag {
  background: #e9ffe2;
  color: #1b9536;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.75rem;
}
ul {
  margin: 0.5rem 0;
  padding-left: 1.2rem;
  color: #333;
  font-size: 0.9rem;
}
.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
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
