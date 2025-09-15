<template>
  <section class="card">
    <header class="card__head">
      <h2>Manual Behavior Input</h2>
      <p>
        Manually input your behavior patterns if you prefer not to upload
        documents.
      </p>
    </header>

    <form @submit.prevent="save" class="card__body">
      <!-- Sleep schedule -->
      <div class="row-title">Typical Sleep Schedule</div>
      <div class="grid-2">
        <div class="field">
          <label>Bedtime</label>
          <select v-model="form.bedtime">
            <option v-for="t in timeOptions" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Wake time</label>
          <select v-model="form.wakeTime">
            <option v-for="t in timeOptions" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Spending -->
      <div class="row-title" style="margin-top: 1rem">
        Monthly Spending Categories
      </div>
      <div class="grid-1">
        <div class="field">
          <label>Food &amp; Dining (฿)</label>
          <input
            type="number"
            min="0"
            step="50"
            v-model.number="form.spendFood"
          />
        </div>
        <div class="field">
          <label>Entertainment (฿)</label>
          <input
            type="number"
            min="0"
            step="50"
            v-model.number="form.spendEntertainment"
          />
        </div>
        <div class="field">
          <label>Utilities (฿)</label>
          <input
            type="number"
            min="0"
            step="50"
            v-model.number="form.spendUtilities"
          />
        </div>
      </div>

      <!-- Pref flags (optional; you already had these) -->
      <div class="grid-2" style="margin-top: 0.75rem">
        <label class="check"
          ><input type="checkbox" v-model="form.locationSharing" /> Share my
          rough location with matches</label
        >
        <label class="check"
          ><input type="checkbox" v-model="form.emailNotification" /> Email me
          important updates</label
        >
      </div>

      <div class="actions">
        <button class="btn" :disabled="saving">
          {{ saving ? "Saving…" : "Save" }}
        </button>

        <RouterLink class="btn btn--outline" :to="{ name: 'quiz-edit' }">
          Edit Quiz
        </RouterLink>

        <span v-if="error" class="error">{{ error }}</span>
        <span v-if="saved" class="ok">Saved</span>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "@/api";

const saving = ref(false);
const saved = ref(false);
const error = ref("");

const form = reactive({
  bedtime: "23:00",
  wakeTime: "07:00",
  spendFood: 0,
  spendEntertainment: 0,
  spendUtilities: 0,
  locationSharing: false,
  emailNotification: false,
});

const timeOptions = (() => {
  // 30-minute steps, 6:00 PM -> 11:30 PM -> ... -> 10:00 AM etc.
  const list = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}`;
      const hour12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
      list.push({ value, label });
    }
  }
  return list;
})();

onMounted(load);
async function load() {
  try {
    const { data } = await api.get("/room-finder/me/behavioral");
    Object.assign(form, {
      bedtime: data.bedtime ?? form.bedtime,
      wakeTime: data.wakeTime ?? form.wakeTime,
      spendFood: data.spendFood ?? 0,
      spendEntertainment: data.spendEntertainment ?? 0,
      spendUtilities: data.spendUtilities ?? 0,
      locationSharing: !!data.locationSharing,
      emailNotification: !!data.emailNotification,
    });
  } catch (e) {
    // optional: show a toast
  }
}

async function save() {
  error.value = "";
  saved.value = false;
  saving.value = true;
  try {
    await api.put("/room-finder/me/behavioral", { ...form });
    saved.value = true;
    setTimeout(() => (saved.value = false), 1500);
  } catch (e) {
    error.value = "Failed to save. Please try again.";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.card {
  border: 1px solid #d4f0dc;
  border-radius: 10px;
  background: #f3fff4;
}
.card__head {
  padding: 0.9rem 1rem;
  background: #e9fbef;
  border-bottom: 1px solid #d4f0dc;
}
.card__head h2 {
  margin: 0 0 0.25rem;
  color: #0c4a23;
}
.card__body {
  padding: 1rem;
}

.row-title {
  font-weight: 700;
  color: #0c4a23;
  margin-bottom: 0.4rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.grid-1 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.field label {
  display: block;
  font-size: 0.9rem;
  color: #0c4a23;
  margin-bottom: 0.25rem;
}
select,
input[type="number"] {
  width: 100%;
  border: 1px solid #1b9536;
  border-radius: 8px;
  padding: 0.55rem 0.6rem;
  background: #fff;
  outline: none;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0c4a23;
}

.actions {
  margin-top: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.btn {
  background: #1b9536;
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 800;
  cursor: pointer;
}
.error {
  color: #c92a2a;
}
.ok {
  color: #0f7b29;
}
.btn--outline {
  background: #fff;
  color: #1b9536;
  border: 1px solid #1b9536;
}
.btn--outline:hover {
  background: rgba(27, 149, 54, 0.08);
}
.actions .btn,
.actions .btn--outline {
  min-width: 120px;
}

@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
