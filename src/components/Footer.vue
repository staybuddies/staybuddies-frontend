<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <img src="../assets/logo.png" alt="StayBuddies" class="logo" />

        <span class="brand">StayBuddies</span>
      </div>
      <div class="footer-right">
        © 2025 <span class="brand">StayBuddies</span>. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: white;
  border-top: 1px solid #ccc;
  padding: 1rem 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #444;
}
.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
.footer-brand {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
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
}
.footer-right {
  font-weight: 500;
}
</style>