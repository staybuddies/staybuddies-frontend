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
      <button @click="prevQuestion" :disabled="currentQuestionIndex === 0">
        ← Previous
      </button>
      <button
        v-if="currentQuestionIndex < questions.length - 1"
        @click="nextQuestion"
        :disabled="!answers[currentQuestionIndex]"
      >
        Next →
      </button>
      <button
        v-else
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
  {
    question: "Budget flexibility for rent?",
    subtitle: "Higher score = more flexible",
    options: [
      { text: "Very flexible", weight: 5 },
      { text: "Somewhat flexible", weight: 4 },
      { text: "Average", weight: 3 },
      { text: "Tight budget", weight: 2 },
      { text: "Very tight", weight: 1 },
    ],
  },
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
  {
    question: "Morning vs. night person?",
    subtitle: "Higher = morning person",
    options: [
      { text: "Strong morning person", weight: 5 },
      { text: "Slightly morning", weight: 4 },
      { text: "Neither", weight: 3 },
      { text: "Slightly night", weight: 2 },
      { text: "Strong night owl", weight: 1 },
    ],
  },
  {
    question: "How often do you cook at home?",
    subtitle: "Higher score = less cooking",
    options: [
      { text: "Rarely cook", weight: 5 },
      { text: "1–2x/week", weight: 4 },
      { text: "3–4x/week", weight: 3 },
      { text: "Most days", weight: 2 },
      { text: "Every day", weight: 1 },
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
      // Fill selections by matching weights to the closest option
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

  // Convert selected option objects → list of weights
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
  background: #1b9536;
  height: 8px;
}
.question-card {
  background: #f0fff0;
  padding: 1rem;
  border: 1px solid #1b9536;
  border-radius: 8px;
}
.subtitle {
  color: #444;
  margin: 0.25rem 0 1rem;
}
.option {
  margin-top: 0.5rem;
}
.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
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
