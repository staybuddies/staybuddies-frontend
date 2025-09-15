<template>
  <div class="quiz-container">
    <h1>Lifestyle Quiz</h1>
    <p>Answer these questions to help us find your perfect roommate match.</p>

    <div class="progress-bar">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>

    <p>Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>
    <div class="question-card">
      <h2>{{ current.question }}</h2>
      <p class="subtitle">{{ current.subtitle }}</p>

      <div v-for="(opt, i) in current.options" :key="i" class="option">
        <label>
          <input
            type="radio"
            :name="'q-' + currentQuestionIndex"
            :value="opt"
            v-model="answers[currentQuestionIndex]"
          />
          {{ opt.text }}
        </label>
      </div>
    </div>

    <div class="buttons">
      <button
        type="button"
        class="btn btn--outline"
        @click="prevQuestion"
        :disabled="currentQuestionIndex === 0"
      >
        ← Previous
      </button>

      <button
        v-if="currentQuestionIndex < questions.length - 1"
        type="button"
        class="btn btn--solid"
        @click="nextQuestion"
        :disabled="!answers[currentQuestionIndex]"
      >
        Next →
      </button>

      <button
        v-else
        type="button"
        class="btn btn--solid"
        @click="submitQuiz"
        :disabled="!answers[currentQuestionIndex]"
      >
        Submit
      </button>
    </div>

    <p v-if="saving">Saving…</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">Saved! Redirecting…</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();
const saving = ref(false);
const error = ref("");
const success = ref(false);

const questions = ref([
  // 1) Bedtime
  {
    question: "What time do you typically go to bed on weeknights?",
    subtitle: "Select the option that best describes you.",
    options: [
      { text: "Before 10 PM", weight: 5 },
      { text: "10 PM - 12 AM", weight: 4 },
      { text: "12 AM - 2 AM", weight: 2 },
      { text: "After 2 AM", weight: 1 },
    ],
  },
  // 2) Cleanliness
  {
    question: "How tidy do you keep shared spaces?",
    subtitle: "1 = messy, 5 = very tidy",
    options: [
      { text: "Very tidy", weight: 5 },
      { text: "Mostly tidy", weight: 4 },
      { text: "Average", weight: 3 },
      { text: "Sometimes messy", weight: 2 },
      { text: "Messy", weight: 1 },
    ],
  },
  // 3) Noise sensitivity
  {
    question: "How sensitive are you to noise at night?",
    subtitle: "Higher score = prefers quieter home",
    options: [
      { text: "Very sensitive", weight: 5 },
      { text: "Somewhat sensitive", weight: 4 },
      { text: "Average", weight: 3 },
      { text: "Not very sensitive", weight: 2 },
      { text: "Not sensitive", weight: 1 },
    ],
  },
  // 4) Guests
  {
    question: "How often do you have guests over?",
    subtitle: "Higher score = fewer guests",
    options: [
      { text: "Rarely", weight: 5 },
      { text: "Monthly", weight: 4 },
      { text: "Weekly", weight: 3 },
      { text: "Few times a week", weight: 2 },
      { text: "Most days", weight: 1 },
    ],
  },
  // 5) Pets
  {
    question: "Are you okay living with pets?",
    subtitle: "Pet friendliness",
    options: [
      { text: "Love pets", weight: 5 },
      { text: "Okay with small pets", weight: 4 },
      { text: "Neutral", weight: 3 },
      { text: "Prefer no pets", weight: 2 },
      { text: "Allergic / No pets", weight: 1 },
    ],
  },
  // 6) Smoking tolerance
  {
    question: "Smoking tolerance at home?",
    subtitle: "Higher score = less tolerant",
    options: [
      { text: "No smoking at all", weight: 5 },
      { text: "Outdoor only", weight: 4 },
      { text: "Occasionally okay", weight: 3 },
      { text: "Indoor okay", weight: 2 },
      { text: "Don’t care", weight: 1 },
    ],
  },
  // 7) Budget flexibility (keep as-is if you like)
  {
    question:
      "How comfortable are you discussing issues directly with a roommate?",
    subtitle: "Higher score = more open communicator",
    options: [
      { text: "Very comfortable and proactive", weight: 5 },
      { text: "Comfortable with respectful talks", weight: 4 },
      { text: "Neutral / depends on the issue", weight: 3 },
      { text: "Prefer to avoid confrontation", weight: 2 },
      { text: "Avoid discussing issues directly", weight: 1 },
    ],
  },
  // 8) Work/Study alignment importance (keep as-is)
  {
    question: "Work/Study schedule alignment importance?",
    subtitle: "Higher score = very important",
    options: [
      { text: "Very important", weight: 5 },
      { text: "Important", weight: 4 },
      { text: "Neutral", weight: 3 },
      { text: "Not important", weight: 2 },
      { text: "Doesn’t matter", weight: 1 },
    ],
  },
  // 9) NEW — Rent budget (THB)
  {
    question: "What monthly rent budget can you afford (THB)?",
    subtitle: "Pick the closest bracket in Thai baht (THB).",
    options: [
      { text: "≤ 4,000 THB", weight: 1 },
      { text: "4,001 – 6,000 THB", weight: 2 },
      { text: "6,001 – 8,000 THB", weight: 3 },
      { text: "8,001 – 10,000 THB", weight: 4 },
      { text: "> 10,000 THB", weight: 5 },
    ],
  },
  // 10) NEW — Nationality / region
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
]);

const currentQuestionIndex = ref(0);
const answers = ref(Array(questions.value.length).fill(null));
const current = computed(() => questions.value[currentQuestionIndex.value]);
const progress = computed(
  () => ((currentQuestionIndex.value + 1) / questions.value.length) * 100
);

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  }
}
function prevQuestion() {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--;
}

async function loadExisting() {
  try {
    const { data } = await api.get("/room-finder/me/quiz");
    if (Array.isArray(data.answers) && data.answers.length === 10) {
      answers.value = data.answers.map((w, idx) => {
        return questions.value[idx].options.find((o) => o.weight === w) ?? null;
      });
    }
  } catch {
    // not taken yet – ignore
  }
}

async function submitQuiz() {
  error.value = "";
  success.value = false;

  const weights = answers.value.map((a) => a?.weight ?? null);
  if (weights.some((w) => w == null)) {
    error.value = "Please answer every question.";
    return;
  }

  saving.value = true;
  try {
    await api.post("/room-finder/me/quiz", { answers: weights });
    success.value = true;
    setTimeout(() => router.push("/matches"), 600);
  } catch (e) {
    console.error(e);
    error.value = "Could not save quiz. Please try again.";
  } finally {
    saving.value = false;
  }
}

onMounted(loadExisting);
</script>

<style scoped>
.quiz-container {
  --green: #1b9536;
  --green-hover: #16812d;
  --green-tint: rgba(27, 149, 54, 0.08);

  max-width: 720px;
  margin: 2rem auto;
  padding: 1rem;
}
.progress-bar {
  background: #eee;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}
.progress {
  background: var(--green);
  height: 8px;
}
.question-card {
  background: #f0fff0;
  padding: 1rem;
  border: 1px solid var(--green);
  border-radius: 8px;
}
.subtitle {
  color: #444;
  margin: 0.25rem 0 1rem;
}
.option {
  margin-top: 0.5rem;
}

/* Buttons layout */
.buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* Button styles */
.btn {
  appearance: none;
  border-radius: 10px;
  font-weight: 800;
  font-size: 1rem;
  padding: 0.75rem 1.15rem;
  min-width: 140px;
  cursor: pointer;
  border: 1px solid var(--green);
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease,
    box-shadow 0.18s ease, transform 0.02s ease;
  line-height: 1;
}

.btn--solid {
  background: var(--green);
  color: #fff;
}
.btn--solid:hover:not(:disabled) {
  background: var(--green-hover);
  border-color: var(--green-hover);
  box-shadow: 0 8px 22px rgba(27, 149, 54, 0.25);
}

.btn--outline {
  background: #fff;
  color: var(--green);
}
.btn--outline:hover:not(:disabled) {
  background: var(--green-tint);
  box-shadow: 0 6px 16px rgba(27, 149, 54, 0.15);
}

/* Focus & disabled */
.btn:focus-visible {
  outline: 3px solid rgba(27, 149, 54, 0.35);
  outline-offset: 2px;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Mobile: stack buttons */
@media (max-width: 520px) {
  .buttons {
    flex-direction: column-reverse;
  }
  .btn {
    width: 100%;
  }
}

.error {
  color: #c92a2a;
  margin-top: 0.75rem;
}
.success {
  color: #0f7b29;
  margin-top: 0.75rem;
}
</style>
