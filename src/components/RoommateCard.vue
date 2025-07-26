<template>
  <div class="card">
    <div class="initial">{{ initial }}</div>
    <h3>{{ name }}, {{ age }}</h3>
    <p class="desc">{{ desc }}</p>
    <div class="tags">
      <span v-for="(tag, index) in tagsArray" :key="index" class="tag">{{ tag }}</span>
    </div>
    <button class="profile-btn">View Profile</button>
  </div>
</template>

<script>
export default {
  props: ['initial', 'name', 'age', 'desc', 'tags'],
  computed: {
    tagsArray() {
      return this.tags.split(',')
    }
  }
}
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 8px;
  padding: 2rem;
  width: 260px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.initial {
  background-color: #d4ff87;
  color: #1b9536;
  font-size: 2rem;
  font-weight: bold;
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
h3 {
  color: #1b9536;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.desc {
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 1rem;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.tag {
  background-color: #e9ffe2;
  color: #1b9536;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
.profile-btn {
  background-color: white;
  color: #1b9536;
  border: 2px solid #1b9536;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
}
</style>
