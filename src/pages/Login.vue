<template>
  <section class="auth-page">
    <div class="auth-card">
      <h2>Welcome back</h2>
      <p>Enter your details to get started finding your perfect roommate</p>

      <form @submit.prevent="onSubmit" novalidate>
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model.trim="email"
          placeholder="Enter your email"
          required
          autocomplete="email"
        />

        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="Enter your password"
          required
          autocomplete="current-password"
        />

        <button class="primary-btn" type="submit" :disabled="loading">
          <span v-if="!loading">Get Started</span>
          <span v-else>Signing in…</span>
        </button>

        <p v-if="error" class="error">{{ error }}</p>

        <p class="footer-link">
          Don't have an account?
          <router-link to="/register">Sign up</router-link>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/api";

const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    const { data } = await api.post("/authenticate", {
      email: email.value,
      password: password.value,
    });

    // backend may return {token: "..."} or {jwt: "..."} depending on your LoginResponse
    const token = data.token ?? data.jwt;
    if (!token) throw new Error("No token returned");

    localStorage.setItem("token", token);

    // go to intended page or profile
    router.push(
      (route.query.redirect && route.query.redirect.toString()) || "/"
    );
  } catch (e) {
    console.error(e);
    error.value = "Login failed. Check your email/password.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  background-color: #faffd6;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}
.auth-card {
  width: 100%;
  max-width: 420px;
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
input {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #1b9536;
  border-radius: 6px;
  outline: none;
}
input:focus {
  box-shadow: 0 0 0 3px rgba(27, 149, 54, 0.15);
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
</style>
