<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="left">
        <img src="../assets/logo.png" alt="StayBuddies" class="logo" />
        <span class="brand">StayBuddies</span>
      </div>
      <ul class="nav-links">
        <li>
          <router-link
            to="/dashboard"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/dashboard' }"
          >
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link
            to="/matches"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/matches' }"
          >
            Matches
          </router-link>
        </li>
        <li>
          <router-link
            to="/messages"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/messages' }"
          >
            Messages
          </router-link>
        </li>
        <li>
          <router-link
            to="/profile"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/profile' }"
          >
            Profile
          </router-link>
        </li>
      </ul>
      <div class="right-icons">
        <span class="nav-icon">🔔</span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #ddd;
  width: 100%;
}

.navbar-container {
  width: 100%;
  padding: 0.5rem 0.05rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
.logo {
  height: 40px;
  margin-right: 0.5rem;
}
.icon {
  margin-right: 0.5rem;
  font-size: 1.5rem;
}

.brand {
  color: #1b9536;
  font-weight: bold;
  font-size: 1.3rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #1b9536;
  font-weight: 600;
  font-size: 1rem;
}

.nav-link:hover {
  text-decoration: underline;
}

:deep(.active-link) {
  color: #0b5e1f !important;
  
}

.right-icons {
  flex: 0 0 auto;
  display: flex;
  gap: 1.5rem;
  font-size: 1.3rem;
  color: #1b9536;
}

.nav-icon {
  cursor: pointer;
}
</style>


