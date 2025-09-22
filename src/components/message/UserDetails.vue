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
      <button class="btn btn-warn" @click="openReport">Report</button>
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

    <!-- Report modal -->
    <div v-if="showReport" class="modal-backdrop" @click.self="closeReport">
      <div class="modal">
        <h3>Report {{ user.name }}</h3>

        <label class="label">Reason</label>
        <select v-model="reportReason">
          <option disabled value="">Select a reason</option>
          <option v-for="r in reasons" :key="r" :value="r">{{ r }}</option>
        </select>

        <label class="label">Details (optional)</label>
        <textarea
          v-model="reportDetails"
          rows="4"
          placeholder="Describe the issue…"
        ></textarea>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeReport">Cancel</button>
          <button
            class="btn btn-warn"
            :disabled="!reportReason || sendingReport"
            @click="submitReport"
          >
            {{ sendingReport ? "Sending…" : "Submit Report" }}
          </button>
        </div>
      </div>
    </div>
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
const details = ref({});
const tags = ref([]);

const initial = computed(() =>
  (props.user?.name || "?").trim().charAt(0).toUpperCase()
);

async function load() {
  if (!props.user?.id) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/room-finder/${props.user.id}/public`);
    details.value = data || {};
    tags.value = Array.isArray(data?.lifestyleTags) ? data.lifestyleTags : [];
  } catch {
    details.value = {};
    tags.value = [];
  } finally {
    loading.value = false;
  }
}
watch(
  () => props.user?.id,
  () => load(),
  { immediate: true }
);

/* ---- Report modal state ---- */
const showReport = ref(false);
const reasons = [
  "Harassment or hate",
  "Scam or spam",
  "Inappropriate content",
  "Impersonation",
  "Safety concern",
  "Other",
];
const reportReason = ref("");
const reportDetails = ref("");
const sendingReport = ref(false);

function openReport() {
  reportReason.value = "";
  reportDetails.value = "";
  showReport.value = true;
}
function closeReport() {
  if (sendingReport.value) return;
  showReport.value = false;
}

async function submitReport() {
  if (!props.user?.id || !reportReason.value) return;
  try {
    sendingReport.value = true;
    await api.post("/reports", {
      targetUserId: Number(props.user.id),
      reason: reportReason.value,
      details: reportDetails.value || null,
    });
    alert("Report submitted. Our team will review it. Thank you.");
    showReport.value = false;
  } catch (e) {
    console.error(e);
    alert("Could not submit the report. Please try again.");
  } finally {
    sendingReport.value = false;
  }
}
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
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.btn {
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid transparent;
}
.btn-primary {
  background: #1b9536;
  color: #fff;
  flex: 1;
}
.btn-outline {
  background: #fff;
  color: #1b9536;
  border-color: #1b9536;
  flex: 1;
}
.btn-warn {
  background: #fff2f2;
  color: #b42318;
  border-color: #f5c2c0;
  flex: 1;
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

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.35);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  width: min(520px, 92vw);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e6e6e6;
  box-shadow: 0 18px 36px rgba(2, 20, 7, 0.12);
}
.modal h3 {
  margin: 0 0 0.5rem;
  color: #0c4a23;
}
.label {
  display: block;
  font-weight: 700;
  color: #0c4a23;
  margin-top: 0.6rem;
  margin-bottom: 0.25rem;
}
select,
textarea {
  width: 100%;
  border: 1px solid #d0e7d8;
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
  outline: none;
}
textarea {
  resize: vertical;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.8rem;
}
</style>
