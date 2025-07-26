
<template>
   <div><Navbar /></div> 
  <section class="dashboard">
    
    <h1>Dashboard</h1>
    <p class="welcome">Welcome back! Here's an overview of your roommate matching journey.</p>

    <div class="profile-completion">
      <h2>Profile Completion</h2>
      <p>Complete your profile to improve your matching results.</p>
      <div class="progress-bar">
        <div class="progress" style="width: 75%">75%</div>
      </div>
      <ul class="missing-info">
        <li>Profile picture</li>
        <li>Lifestyle preferences</li>
      </ul>
      <button class="btn-primary">Complete Your Profile</button>
    </div>

    <div class="recent-matches">
      <h2>Recent Matches</h2>
      <p>Your most recent potential roommate matches</p>
      <div class="match-card">
        <div class="avatar">A</div>
        <div class="info">
          <strong>Alex Johnson</strong>
          <span class="percent">92% match</span>
        </div>
        <span class="status pending">Pending</span>
      </div>
      <div class="match-card">
        <div class="avatar">J</div>
        <div class="info">
          <strong>Jamie Smith</strong>
          <span class="percent">87% match</span>
          <small>3 days ago</small>
        </div>
        <span class="status matched">Matched</span>
      </div>
      <div class="match-card">
        <div class="avatar">T</div>
        <div class="info">
          <strong>Taylor William</strong>
          <span class="percent">85% match</span>
          <small>1 week ago</small>
        </div>
        <span class="status pending">Pending</span>
      </div>
      <button class="btn-secondary">View All Matches</button>
    </div>

    <RoommateTabs />
    
  </section>
</template>

<script>
import RoommateTabs from '../components/RoommateTabs.vue';
import Navbar from '../components/Navbar.vue';

export default {
  name: 'Dashboard',
  components: {
    RoommateTabs,
    Navbar
  }
}
</script>

<style scoped>
.dashboard {
  background: #faffd6;
  padding: 2rem;
  font-family: sans-serif;
  min-height: 100vh;
}
h1 {
  color: #1b9536;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.welcome {
  margin-bottom: 2rem;
  color: #444;
}
.profile-completion {
  background: #e6fff1;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}
.profile-completion h2 {
  margin-bottom: 0.5rem;
  color: #1b9536;
}
.progress-bar {
  background: #eee;
  border-radius: 6px;
  overflow: hidden;
  height: 16px;
  margin: 1rem 0;
}
.progress {
  background: #1b9536;
  color: white;
  text-align: right;
  padding: 0 0.5rem;
  height: 100%;
  font-size: 0.8rem;
  line-height: 16px;
}
.missing-info {
  margin: 0.5rem 0;
  color: #444;
  font-size: 0.95rem;
}
.btn-primary {
  background: #1b9536;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}
.recent-matches {
  background: #e6fff1;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}
.recent-matches h2 {
  margin-bottom: 0.5rem;
  color: #1b9536;
}
.match-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;
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
}
.info {
  flex: 1;
  margin-left: 1rem;
}
.info strong {
  color: #1b9536;
  display: block;
}
.percent {
  font-size: 0.85rem;
  color: #1b9536;
}
.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status.pending {
  background: #fff8c4;
  color: #8f7400;
}
.status.matched {
  background: #d4ff87;
  color: #1b9536;
}
.btn-secondary {
  background: #1b9536;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
