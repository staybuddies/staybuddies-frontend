<template>
  <section class="wrap">
    <div class="card">
      <div class="icon">⛔</div>
      <h1>Account suspended</h1>
      <p>
        Your account is currently suspended. You can’t access matching or
        messaging. If you think this is a mistake, please contact support.
      </p>

      <div class="actions">
        <a class="btn primary" @click.prevent="logout">Log out</a>
        <a class="btn ghost" :href="mailto">Contact Support</a>
      </div>

      <small class="hint">
        Error code: <b>SUSPENDED</b>. If you were just re-activated, try signing
        in again.
      </small>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const mailto = "mailto:support@roomfinder.app?subject=Suspended%20account";

function logout() {
  // clear your auth; adjust keys to your app
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  // optionally clear any cached user state if you use a store
  router.replace({ path: "/login" });
}
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #faffd6;
  padding: 2rem;
}
.card {
  width: min(720px, 92vw);
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 1.6rem;
  text-align: center;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
}
.icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}
h1 {
  margin: 0.2rem 0 0.5rem;
  color: #0c4a23;
  font-weight: 900;
}
p {
  color: #344054;
  line-height: 1.5;
}
.actions {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  margin: 1rem 0 0.4rem;
  flex-wrap: wrap;
}
.btn {
  border: 0;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  padding: 0.7rem 1.1rem;
  text-decoration: none;
}
.primary {
  background: #1b9536;
  color: #fff;
}
.ghost {
  background: #e6fff1;
  color: #1b9536;
  border: 1px solid #b8f1ce;
}
.hint {
  color: #667085;
}
</style>
