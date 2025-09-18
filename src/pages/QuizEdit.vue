<template>
  <section class="quiz-edit">
    <header class="topbar">
      <button
        class="back-btn"
        type="button"
        @click="goBack"
        aria-label="Go back"
      >
        <span class="back-icon">←</span>
        <span class="back-text">Back</span>
      </button>

      <h1>Lifestyle Quiz</h1>
      <div class="actions"></div>
    </header>

    <div v-if="loading" class="state">Loading…</div>

    <div v-else class="stack">
      <article
        v-for="(q, idx) in questions"
        :key="idx"
        class="qcard"
        :class="{ invalid: answers[idx] == null }"
      >
        <!-- header row -->
        <div class="qhead">
          <div class="icon">{{ icons[idx] }}</div>
          <div class="labels">
            <div class="chips">
              <span class="chip">Question {{ idx + 1 }}</span>
              <span v-if="answers[idx] != null" class="chip chip--ok"
                >Answered</span
              >
            </div>
            <h3 class="q">{{ q.question }}</h3>
            <div class="sub">{{ q.subtitle }}</div>
          </div>
        </div>

        <!-- choices row -->
        <div class="opts">
          <button
            v-for="(opt, i) in q.options"
            :key="i"
            type="button"
            class="opt"
            :class="{ active: answers[idx] === opt.weight }"
            :aria-pressed="answers[idx] === opt.weight"
            @click="answers[idx] = opt.weight"
          >
            <span class="num">{{ i + 1 }}</span>
            <span class="txt">{{ opt.text }}</span>
          </button>
        </div>

        <!-- selected ribbon -->
        <div class="ribbon">
          <span v-if="answers[idx] != null">
            Selected: <strong>{{ textFor(idx, answers[idx]) }}</strong>
          </span>
          <span v-else class="muted">Pick an option above</span>
        </div>
      </article>

      <!-- bottom save bar -->
      <footer class="savebar">
        <div class="left">
          <span v-if="!isComplete" class="warn"
            >Please answer every question.</span
          >
          <span v-else-if="dirty" class="muted">You have unsaved changes.</span>
          <span v-else class="muted">All changes saved.</span>
        </div>
        <div class="right">
          <button
            class="btn btn--outline"
            @click="resetToServer"
            :disabled="saving || !loadedOnce"
          >
            Reset
          </button>
          <button class="btn" @click="save" :disabled="saving || !isComplete">
            {{ saving ? "Saving…" : "Save Changes" }}
          </button>
        </div>
      </footer>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="saved" class="ok">Saved!</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router"; // ⬅️ add
import api from "@/api";

const router = useRouter(); // ⬅️ add
const route = useRoute(); // ⬅️ add

const loading = ref(true);
const saving = ref(false);
const error = ref("");
const saved = ref(false);
const loadedOnce = ref(false);

const icons = ["🕒", "🧽", "🔈", "👥", "🐾", "🚭", "💬", "📅", "💸", "🌏"];

const questions = [
  {
    question: "What time do you typically go to bed on weeknights?",
    subtitle: "Select the option that best describes you.",
    options: [
      { text: "Before 10 PM", weight: 5 },
      { text: "10 PM - 11 PM", weight: 4 },
      { text: "11 PM - 12 AM", weight: 3 },
      { text: "12 AM - 1 AM", weight: 2 },
      { text: "After 1 AM", weight: 1 },
    ],
  },
  {
    question: "How tidy do you keep shared spaces?",
    subtitle: "1 = messy, 5 = very tidy",
    options: [
      { text: "Very messy", weight: 1 },
      { text: "Somewhat messy", weight: 2 },
      { text: "Average", weight: 3 },
      { text: "Pretty tidy", weight: 4 },
      { text: "Very tidy", weight: 5 },
    ],
  },
  {
    question: "How sensitive are you to noise at night?",
    subtitle: "Higher score = prefer quieter home",
    options: [
      { text: "Not sensitive", weight: 1 },
      { text: "Slightly sensitive", weight: 2 },
      { text: "Moderately sensitive", weight: 3 },
      { text: "Very sensitive", weight: 4 },
      { text: "Extremely sensitive", weight: 5 },
    ],
  },
  {
    question: "How often do you have guests over?",
    subtitle: "Higher score = fewer guests",
    options: [
      { text: "Daily", weight: 1 },
      { text: "Few times a week", weight: 2 },
      { text: "Weekly", weight: 3 },
      { text: "Monthly", weight: 4 },
      { text: "Rarely", weight: 5 },
    ],
  },
  {
    question: "Are you okay living with pets?",
    subtitle: "Pet friendliness",
    options: [
      { text: "Love pets", weight: 5 },
      { text: "Like pets", weight: 4 },
      { text: "Neutral", weight: 3 },
      { text: "Prefer no pets", weight: 2 },
      { text: "Allergic/No pets", weight: 1 },
    ],
  },
  {
    question: "Smoking tolerance at home?",
    subtitle: "Higher score = less tolerant",
    options: [
      { text: "Don’t care", weight: 1 },
      { text: "Indoor okay", weight: 2 },
      { text: "Occasionally okay", weight: 3 },
      { text: "Outdoor only", weight: 4 },
      { text: "No smoking at all", weight: 5 },
    ],
  },
  {
    question:
      "How comfortable are you discussing issues directly with a roommate?",
    subtitle: "Higher score = more open communicator",
    options: [
      { text: "Avoid direct discussion", weight: 1 },
      { text: "Prefer to avoid confrontation", weight: 2 },
      { text: "Neutral / depends", weight: 3 },
      { text: "Comfortable with respectful talks", weight: 4 },
      { text: "Very comfortable & proactive", weight: 5 },
    ],
  },
  {
    question: "Work/Study schedule alignment importance?",
    subtitle: "Higher score = very important",
    options: [
      { text: "Doesn’t matter", weight: 1 },
      { text: "Not important", weight: 2 },
      { text: "Neutral", weight: 3 },
      { text: "Important", weight: 4 },
      { text: "Very important", weight: 5 },
    ],
  },
  {
    question: "What monthly rent budget can you afford (THB)?",
    subtitle: "Pick the closest bracket.",
    options: [
      { text: "≤ 4,000 THB", weight: 1 },
      { text: "4,001 – 6,000 THB", weight: 2 },
      { text: "6,001 – 8,000 THB", weight: 3 },
      { text: "8,001 – 10,000 THB", weight: 4 },
      { text: "> 10,000 THB", weight: 5 },
    ],
  },
  {
    question: "What is your nationality / region group?",
    subtitle: "Used only for matching preferences.",
    options: [
      { text: "Thai", weight: 1 },
      { text: "ASEAN (non-Thai)", weight: 2 },
      { text: "East/South Asia", weight: 3 },
      { text: "Europe/Americas/Oceania", weight: 4 },
      { text: "Other / Prefer not to say", weight: 5 },
    ],
  },
];

const answers = ref(Array(questions.length).fill(null));
const serverSnapshot = ref(Array(questions.length).fill(null));

const isComplete = computed(() => answers.value.every((v) => v != null));
const dirty = computed(
  () => JSON.stringify(answers.value) !== JSON.stringify(serverSnapshot.value)
);

function textFor(idx, weight) {
  const opt = questions[idx].options.find((o) => o.weight === weight);
  return opt ? opt.text : "";
}
function goBack() {
  // Prefer a returnTo query if present (keeps your existing pattern)
  const returnTo = route.query.returnTo;
  if (typeof returnTo === "string" && returnTo.length) {
    router.replace(returnTo);
    return;
  }

  // Otherwise, try browser back; if no history, fall back home
  if (window.history.length > 1) router.back();
  else router.push("/");
}

async function loadExisting() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/room-finder/me/quiz", {
      params: { t: Date.now() }, // cache-buster
    });
    if (
      Array.isArray(data.answers) &&
      data.answers.length === questions.length
    ) {
      answers.value = data.answers.slice();
      serverSnapshot.value = data.answers.slice();
    } else {
      answers.value = Array(questions.length).fill(null);
      serverSnapshot.value = Array(questions.length).fill(null);
    }
    loadedOnce.value = true;
  } catch {
    error.value = "Could not load existing quiz answers.";
  } finally {
    loading.value = false;
  }
}

function resetToServer() {
  if (!loadedOnce.value) return;
  answers.value = serverSnapshot.value.slice();
  saved.value = false;
}

async function save() {
  if (!isComplete.value) return;
  saving.value = true;
  error.value = "";
  saved.value = false;
  try {
    await api.post("/room-finder/me/quiz", { answers: answers.value });
    serverSnapshot.value = answers.value.slice();
    saved.value = true;

    // ⬇️ navigate back to Behavioral after a tiny visual delay
    setTimeout(() => {
      const returnTo = route.query.returnTo; // e.g. "/settings/behavioral"
      if (typeof returnTo === "string" && returnTo.length) {
        router.replace(returnTo);
      } else {
        router.back();
      }
    }, 250);
  } catch {
    error.value = "Could not save quiz. Please try again.";
  } finally {
    saving.value = false;
  }
}

onMounted(loadExisting);
</script>

<style scoped>
/* palette */
/* Back button next to title */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--green);
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 1px 0 #f2faf4;
  transition: background 0.15s ease, transform 0.06s ease, box-shadow 0.2s ease;
}
.back-btn:hover {
  background: var(--green-ghost);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(27, 149, 54, 0.1);
}
.back-btn:active {
  transform: translateY(0);
}
.back-icon {
  font-size: 1.05rem;
  line-height: 1;
}
.back-text {
  font-size: 0.95rem;
}

/* keep topbar tidy with the new button */
.topbar {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 1rem 0;
}
.topbar h1 {
  margin: 0;
  color: #0c4a23;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.quiz-edit {
  --green: #1b9536;
  --green-ghost: rgba(27, 149, 54, 0.08);
  --card: #f7fff8;
  --line: #dfeee5;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
}
.topbar h1 {
  margin: 0;
  color: #0c4a23;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.state {
  color: #666;
}
.stack {
  display: grid;
  gap: 1rem;
  margin-bottom: 3.5rem;
}

/* card */
.qcard {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 1px 0 #f2faf4;
}
.qcard.invalid {
  border-color: #ffd7d7;
  box-shadow: 0 0 0 2px rgba(201, 42, 42, 0.06) inset;
}
.qhead {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 1rem 1rem 0.5rem;
}
.icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #eef8f0;
  border: 1px solid var(--line);
  font-size: 18px;
}
.labels .chips {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  margin-bottom: 0.35rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-weight: 700;
  color: #0c4a23;
  background: #f5fbf7;
  font-size: 0.78rem;
}
.chip--ok {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}
.q {
  margin: 0;
  color: #0c4a23;
  font-weight: 800;
}
.sub {
  color: #566;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

/* options */
.opts {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
  padding: 0.25rem 1rem 0.6rem;
}
.opt {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 10px;
  padding: 0.55rem 0.6rem;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, background 0.15s;
}
.opt:hover {
  box-shadow: 0 4px 16px rgba(27, 149, 54, 0.08);
}
.opt.active {
  border-color: var(--green);
  background: var(--green);
  color: #fff;
  box-shadow: 0 8px 22px rgba(27, 149, 54, 0.18);
}
.num {
  display: block;
  font-weight: 800;
  margin-bottom: 0.15rem;
}
.txt {
  display: block;
  font-size: 0.85rem;
  line-height: 1.2rem;
  opacity: 0.9;
}

/* selected ribbon */
.ribbon {
  background: #eef9f1;
  border-top: 1px solid var(--line);
  border-radius: 0 0 12px 12px;
  padding: 0.55rem 1rem;
  color: #0c4a23;
}
.ribbon .muted {
  color: #777;
}

/* bottom save bar */
.savebar {
  position: sticky;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: #f3fff4;
  border: 1px solid var(--line);
  border-radius: 10px;
}
.left .warn {
  color: #b42318;
}
.left .muted {
  color: #667;
}
.btn {
  background: var(--green);
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 800;
  cursor: pointer;
}
.btn--outline {
  background: #fff;
  border: 1px solid var(--green);
  color: var(--green);
}
.btn:disabled,
.btn--outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 880px) {
  .opts {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 560px) {
  .qhead {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .opts {
    grid-template-columns: 1fr 1fr;
  }
}
.ok {
  color: #0f7b29;
  margin-top: 0.5rem;
}
.error {
  color: #c92a2a;
  margin-top: 0.5rem;
}
</style>
