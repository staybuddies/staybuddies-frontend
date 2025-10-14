<template>
  <aside class="sidebar">
    <h2>Admin Panel</h2>
    <ul>
      <li><RouterLink to="/admin/dashboard">📊 Dashboard</RouterLink></li>
      <li><RouterLink to="/admin/users">👥 User Management</RouterLink></li>
      <li>
        <RouterLink to="/admin/management">🔐 Admin Management</RouterLink>
      </li>
      <li>
        <RouterLink to="/admin/reports">📋 Reports & Moderation</RouterLink>
      </li>
    </ul>
  </aside>
</template>

<script setup>
/* presentational only */
</script>

<style scoped>
aside.sidebar {
  background: #0f6130;
  color: #fff;
  padding: 20px;
  min-height: 100vh;
}

h2 {
  margin: 0 0 12px;
  font: 800 18px/1.2 Inter, system-ui, -apple-system, Segoe UI, Roboto,
    sans-serif;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin: 8px 0;
}

a {
  color: #c6f6d5;
  text-decoration: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

a.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  text-decoration: none;
  border-left: 3px solid #fff;
  padding-left: calc(0.75rem - 3px);
}
</style>
