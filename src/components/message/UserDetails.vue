<!-- src/components/message/UserDetails.vue -->
<template>
  <aside class="user-details">
    <div class="header">
      <div class="avatar">{{ initial }}</div>
      <div class="name-block">
        <h3 class="name">{{ user.name }}</h3>
        <p class="sub">
          <span v-if="user.gender">{{ user.gender }} • </span>
          <span v-if="user.location">{{ user.location }}</span>
        </p>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-primary" @click="$emit('view-profile', user.id)">
        View Profile
      </button>
      <button class="btn btn-outline" @click="$emit('block', user.id)">
        Block
      </button>
    </div>

    <hr class="divider" />

    <div v-if="loading" class="loading">Loading profile…</div>

    <template v-else>
      <!-- Lifestyle -->
      <section v-if="tags.length" class="section">
        <h4 class="section-title">Lifestyle</h4>
        <div class="chips">
          <span v-for="t in tags" :key="t" class="chip">{{ t }}</span>
        </div>
      </section>

      <!-- Education -->
      <section v-if="details.university || details.major" class="section">
        <!-- <h4 class="section-title">Education</h4> -->
        <p v-if="details.university">
          <strong>University:</strong> {{ details.university }}
        </p>
        <p v-if="details.major"><strong>Major:</strong> {{ details.major }}</p>
      </section>

      <!-- Bio -->
      <section v-if="details.bio" class="section">
        <h4 class="section-title">Bio</h4>
        <p class="bio">{{ details.bio }}</p>
      </section>

      <!-- Gentle fallback -->
      <section
        v-if="
          !details.bio && !tags.length && !details.university && !details.major
        "
        class="section muted"
      >
        No additional info yet.
      </section>
    </template>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "@/api";

const props = defineProps({
  user: { type: Object, required: true }, // { id, name, gender, location }
});
defineEmits(["view-profile", "block"]);

const loading = ref(false);
const details = ref({}); // { university, major, bio, lifestyleTags: [] }
const tags = ref([]);

const initial = computed(() =>
  (props.user?.name || "?").trim().charAt(0).toUpperCase()
);

async function load() {
  if (!props.user?.id) return;
  loading.value = true;
  try {
    // Uses your existing public-profile endpoint
    const { data } = await api.get(`/room-finder/${props.user.id}/public`);
    details.value = data || {};
    tags.value = Array.isArray(data?.lifestyleTags) ? data.lifestyleTags : [];
  } catch (e) {
    details.value = {};
    tags.value = [];
    // silent fail – we still show the basic name/initials
  } finally {
    loading.value = false;
  }
}

// refresh when the active conversation changes
watch(
  () => props.user?.id,
  () => load(),
  { immediate: true }
);
</script>

<style scoped>
.user-details {
  background: #ffffff;
  padding: 1rem 1.25rem;
  border-left: 1px solid #e6e6e6;
  height: 100%;
  overflow-y: auto;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue",
    Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
}

/* Header */
.header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e6fff1;
  color: #1b9536;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 1.1rem;
}
.name {
  margin: 0;
  color: #0c4a23;
}
.sub {
  margin: 2px 0 0;
  color: #667085;
  font-size: 0.9rem;
}

/* Buttons side-by-side */
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.btn {
  width: 100%;
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid transparent;
}
.btn-primary {
  background: #1b9536;
  color: #fff;
}
.btn-outline {
  background: #fff;
  color: #1b9536;
  border-color: #1b9536;
}

/* Sections */
.divider {
  border: 0;
  height: 1px;
  background: #eef3ee;
  margin: 0.9rem 0 0.75rem;
}
.section {
  margin-top: 0.75rem;
}
.section-title {
  color: #0c4a23;
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
}

/* Chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.chip {
  background: #e6fff1;
  border: 1px solid #b8f1ce;
  color: #1b9536;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

/* Bio / text */
.bio {
  color: #344054;
  line-height: 1.45;
  margin: 0;
}
.muted {
  color: #98a2b3;
}
.loading {
  color: #667085;
}
</style>
