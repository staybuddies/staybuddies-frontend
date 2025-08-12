<template>
  <section class="auth-page">
    <div class="auth-card">
      <h2>Create an Account</h2>
      <p>Join StayBuddies to find your perfect roommate match</p>

      <form @submit.prevent="registerUser" novalidate>
        <label for="name">Full Name</label>
        <input id="name" v-model.trim="form.name" type="text" required />

        <label for="email">Email</label>
        <input id="email" v-model.trim="form.email" type="email" required />

        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required />

        <label for="phone">Phone</label>
        <input id="phone" v-model.trim="form.phone" type="tel" required />

        <label for="gender">Gender</label>
        <select id="gender" v-model="form.gender">
          <option value="">Prefer not to say</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <label for="age">Age</label>
        <input
          id="age"
          v-model.number="form.age"
          type="number"
          min="16"
          max="99"
        />

        <label for="location">Location</label>
        <input
          id="location"
          v-model.trim="form.location"
          type="text"
          placeholder="City / Area"
        />

        <label for="university">University</label>
        <input id="university" v-model.trim="form.university" type="text" />

        <div class="checkbox-row">
          <input id="ahr" v-model="form.alreadyHasRoom" type="checkbox" />
          <label for="ahr">I already have a room</label>
        </div>

        <button class="primary-btn" type="submit" :disabled="loading">
          <span v-if="!loading">Register</span><span v-else>Creating…</span>
        </button>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">
          Registration successful! Redirecting…
        </p>

        <p class="footer-link">
          Already have an account? <router-link to="/login">Log in</router-link>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();

const form = ref({
  name: "",
  email: "",
  password: "",
  phone: "",
  gender: "",
  age: null,
  location: "",
  university: "",
  alreadyHasRoom: false,
});

const loading = ref(false);
const error = ref("");
const success = ref(false);

async function registerUser() {
  error.value = "";
  success.value = false;

  if (
    !form.value.name ||
    !form.value.email ||
    !form.value.password ||
    !form.value.phone
  ) {
    error.value = "Please fill in name, email, password and phone.";
    return;
  }

  loading.value = true;
  try {
    // baseURL already has /api/v1, so just "/room-finder" here
    await api.post("/room-finder", form.value);
    success.value = true;
    setTimeout(() => router.push("/login"), 900);
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      (e?.response?.status === 409 ? "Email already registered" : null) ||
      "Registration failed. Please try a different email.";
    error.value = msg;
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  background: #faffd6;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}
.auth-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}
h2 {
  color: #1b9536;
  margin-bottom: 0.25rem;
}
p {
  color: #333;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}
label {
  display: block;
  margin-top: 1rem;
  font-weight: 700;
  color: #0c4a23;
}
input,
select {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #1b9536;
  border-radius: 6px;
  outline: none;
}
input:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(27, 149, 54, 0.15);
}
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.primary-btn {
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.8rem;
  border: 0;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  background: #1b9536;
  color: #fff;
}
.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.footer-link {
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}
.footer-link a {
  color: #1b9536;
  font-weight: 700;
  text-decoration: none;
}
.error {
  margin-top: 0.75rem;
  color: #c92a2a;
  font-size: 0.9rem;
}
.success {
  margin-top: 0.75rem;
  color: #0f7b29;
  font-size: 0.9rem;
}
</style>
