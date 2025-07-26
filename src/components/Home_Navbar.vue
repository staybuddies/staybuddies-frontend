<template>
  <nav class="navbar">
    <div class="logo">
      <img src="../assets/logo.png" alt="StayBuddies" class="logo-bed" />
      <span class="brand">StayBuddies</span>
    </div>
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#how-it-works">How It Works</a></li>
      <li><a href="#testimonials">Testimonials</a></li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2%;
  background-color: white;
  border-bottom: 1px solid #ddd;
}
.logo {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
}
.logo-bed {
  height: 40px;
  margin-right: 0.5rem;
}
.icon {
  margin-right: 0.5rem;
  font-size: 1.5rem;
}
.brand {
  color: green;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  justify-content:space-evenly;
  flex: 2;
  font-size: larger;
}
.nav-links li a {
  text-decoration: none;
  color: green;
  font-weight: 600;
}
</style>
