<template>
  <section class="login-page">
    <div class="login-container">
      <h2>Welcome back</h2>
      <p>Enter your details to get started finding your perfect roommate</p>
      <form @submit.prevent="handleSubmit">
        <label for="name">Full Name</label>
        <input type="text" id="name" placeholder="Enter your full name" required />

        <label for="email">Email</label>
        <input type="email" id="email" placeholder="Enter your email" required />

        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Enter your password" required />

        <button type="submit" class="primary-btn">Get Started</button>

        <p class="footer-link">
          Don't have an account? <a href="#">Sign up</a>
        </p>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Login',
  methods: {
    handleSubmit() {
      alert('Form submitted!');
    }
  }
}
</script>

<style scoped>
.login-page {
  background-color: #faffd6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #1B9536;
  width: 100%;
  max-width: 400px;
  text-align: left;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #1B9536;
  margin-bottom: 0.5rem;
}

p {
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

label {
  display: block;
  margin-top: 1rem;
  font-weight: bold;
}

input[type="text"],
input[type="email"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #1B9536;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.info {
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.primary-btn {
  width: 100%;
  background-color: #1B9536;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.footer-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.85rem;
}

.footer-link a {
  color: #1B9536;
  text-decoration: none;
  font-weight: bold;
}
</style>
