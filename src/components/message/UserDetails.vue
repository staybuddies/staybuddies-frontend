<template>
  <aside class="user-details">
    <div class="avatar">{{ user.name.charAt(0) }}</div>
    <h3>{{ user.name }}</h3>
    <p>online</p>
    <button class="btn-primary">View Profile</button>
    <button class="btn-secondary">Block</button>

    
  </aside>
</template>

<script>
export default {
  name: 'UserDetails',
  props: {
    user: Object
  }
}
</script>

<style scoped>
.user-details {
  background: #ffffff;
  padding: 1.5rem;
  border-left: 1px solid #ddd;
  height: 100%;
}
.avatar {
  background: #d4ff87;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: #1b9536;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin: 0 auto 1rem;
  font-size: 2rem;
}
h3 {
  color: #1b9536;
  text-align: center;
  margin-bottom: 0.3rem;
}
p {
  text-align: center;
  color: #333;
}
.btn-primary {
  background: #1b9536;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 4px;
  margin-top: 1rem;
}
.btn-secondary {
  background: white;
  color: #1b9536;
  border: 2px solid #1b9536;
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 4px;
  margin-top: 0.5rem;
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
</style>
