<template>
  <article class="card">
    <div class="row">
      <div class="avatar">{{ initial }}</div>

      <div class="meta">
        <h3>{{ match.name }}</h3>
        <p class="sub">
          <span v-if="match.age">{{ match.age }} • </span>
          <span v-if="match.gender">{{ match.gender }} • </span>
          <span v-if="match.location">{{ match.location }}</span>
        </p>
      </div>

      <div class="compat">
        <div class="score">{{ match.compatibility }}%</div>
        <small>compatibility</small>
      </div>
    </div>

    <div class="actions">
      <router-link
        class="btn-secondary"
        :to="{
          name: 'roomfinder-public',
          params: { id: String(match.userId) },
        }"
        title="View profile"
      >
        View Profile
      </router-link>

      <!-- Status-driven actions -->
      <template v-if="match.relationStatus === 'NONE'">
        <button class="btn-primary" @click="$emit('send')">Send Request</button>
      </template>

      <template v-else-if="match.relationStatus === 'PENDING_SENT'">
        <button class="btn-disabled" disabled>Request Sent</button>
      </template>

      <template v-else-if="match.relationStatus === 'PENDING_RECEIVED'">
        <button class="btn-primary" @click="$emit('accept')">Accept</button>
        <button class="btn-secondary" @click="$emit('decline')">Decline</button>
      </template>

      <template v-else-if="match.relationStatus === 'ACCEPTED'">
        <button class="btn-primary" @click="goMessage">Message</button>
      </template>

      <template v-else-if="match.relationStatus === 'DECLINED'">
        <button class="btn-disabled" disabled>Declined</button>
      </template>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  match: { type: Object, required: true },
});

const router = useRouter();

const initial = computed(() =>
  (props.match?.name || "?").trim().charAt(0).toUpperCase()
);

function goMessage() {
  router.push({
    path: "/messages",
    query: { with: String(props.match.userId) },
  });
}
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}
.row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e6fff1;
  color: #1b9536;
  display: grid;
  place-items: center;
  font-weight: 900;
}
.meta h3 {
  margin: 0;
  color: #0c4a23;
}
.sub {
  margin: 0.15rem 0 0;
  color: #555;
  font-size: 0.9rem;
}
.compat {
  text-align: right;
}
.score {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1b9536;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.9rem;
  flex-wrap: wrap;
}
.btn-primary {
  background: #1b9536;
  color: white;
  border: 0;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}
.btn-secondary {
  background: white;
  color: #1b9536;
  border: 2px solid #1b9536;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn-disabled {
  background: #d9eadf;
  color: #398b53;
  border: 0;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: not-allowed;
}
</style>
