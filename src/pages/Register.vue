<template>
  <section class="register-page">
    <div class="register-container">
      <h2>Create an Account</h2>
      <p>Join StayBuddies to find your perfect roommate match</p>

      <form @submit.prevent="registerUser">
        <label for="name">Full Name</label>
        <input
          type="text"
          id="name"
          v-model="name"
          placeholder="Enter your full name"
          required
        />

        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="Enter your email"
          required
        />

        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Enter a secure password"
          required
        />

        <label for="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          v-model="phone"
          placeholder="09xxxxxxxxx"
          required
        />

        <label for="gender">Gender</label>
        <select v-model="gender" required>
          <option disabled value="">Select gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <label for="age">Age</label>
        <input
          type="number"
          id="age"
          v-model.number="age"
          min="16"
          max="99"
          required
        />

        <label for="university">University</label>
        <input
          type="text"
          id="university"
          v-model="university"
          placeholder="Your university"
          required
        />

        <div class="checkbox-group">
          <input type="checkbox" id="alreadyHasRoom" v-model="alreadyHasRoom" />
          <label for="alreadyHasRoom">I already have a room</label>
        </div>

        <button type="submit" class="primary-btn">Register</button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <p class="footer-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      phone: "",
      gender: "",
      age: null,
      university: "",
      alreadyHasRoom: false,
      errorMessage: "",
    };
  },
  methods: {
    async registerUser() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/room-finder",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: this.name,
              email: this.email,
              password: this.password,
              phone: this.phone,
              gender: this.gender,
              age: this.age,
              university: this.university,
              alreadyHasRoom: this.alreadyHasRoom,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to register");
        }

        const data = await response.json();
        console.log("User registered:", data);
        this.errorMessage = "";

        // 👇 navigate to the login route
        this.$router.push("/login");
      } catch (err) {
        console.error(err);
        this.errorMessage = err.message || "Registration failed. Try again.";
      }
    },
  },
};
</script>

<style scoped>
.register-page {
  background-color: #faffd6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.register-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #1b9536;
  width: 100%;
  max-width: 400px;
  text-align: left;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #1b9536;
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

input,
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.checkbox-group input {
  margin-right: 0.5rem;
}

.primary-btn {
  width: 100%;
  background-color: #1b9536;
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
  color: #1b9536;
  text-decoration: none;
  font-weight: bold;
}

.error {
  color: red;
  font-size: 0.85rem;
  margin-top: 1rem;
}
</style>
