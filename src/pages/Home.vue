<!-- <template>
  <div>
    <Navbar />
    <HeroSection />
    <PotentialRoommates />
    <SmartMatching />
    <StepsToMatch />
    <UserTestimonials />
    <CTASection />
  </div>
</template>

<script>
import HeroSection from '../components/HeroSection.vue'
import PotentialRoommates from '../components/PotentialRoommates.vue'
import SmartMatching from '../components/SmartMatching.vue'
import StepsToMatch from '../components/StepsToMatch.vue'
import UserTestimonials from '../components/UserTestimonials.vue'
import CTASection from '../components/CTASection.vue'
import Navbar from '../components/Home_Navbar.vue'

export default {
  components: {
    Navbar,
    HeroSection,
    PotentialRoommates,
    SmartMatching,
    StepsToMatch,
    UserTestimonials,
    CTASection
    
  }
}
</script> -->

<template>
  <main class="home">
    <section class="hero">
      <div class="copy">
        <h1>
          Find Your Perfect<br />
          Roommate with AI-<br />
          powered Compatibility!
        </h1>
        <p class="tagline">
          Our AI-powered matching system analyzes lifestyle, behavior patterns,
          and preferences to find your ideal roommate.
        </p>

        <div class="cta-row">
          <button class="btn primary" @click="goQuiz">Take the Quiz →</button>
          <router-link class="btn ghost" to="/about">Learn more</router-link>
        </div>

        <div class="auth-row">
          <router-link class="btn link" to="/register">Sign up</router-link>
          <router-link class="btn link" to="/login">Log in</router-link>
        </div>
      </div>

      <div class="hero-art" aria-hidden="true">
        <!-- Placeholder area for an illustration / image / Lottie -->
        <div class="placeholder">
          <span class="camera">🖼️</span>
          <span class="hint">Add your hero image</span>
        </div>
      </div>
    </section>

    <!-- Optional: features band -->
    <section class="features">
      <div class="card">
        <h3>Behavioral quiz</h3>
        <p>10 quick questions to learn your lifestyle and preferences.</p>
      </div>
      <div class="card">
        <h3>Smart matching</h3>
        <p>We compute compatibility scores to surface your best matches.</p>
      </div>
      <div class="card">
        <h3>Safe & private</h3>
        <p>Your data stays secure; you control what you share.</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function isAuthed() {
  // same token your axios instance uses
  return !!localStorage.getItem("token");
}

function goQuiz() {
  if (isAuthed()) {
    router.push("/quiz");
  } else {
    router.push({ path: "/login", query: { redirect: "/quiz" } });
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #faffd6; /* soft lemon */
  display: flex;
  flex-direction: column;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.copy h1 {
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.5px;
  color: #075a2a;
  margin: 0 0 1rem;
}

.tagline {
  font-size: 1.1rem;
  color: #315343;
  margin: 0 0 1.5rem;
}

.cta-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.auth-row {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0.9rem 1.2rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
  transition: transform 120ms ease, box-shadow 120ms ease;
  cursor: pointer;
  user-select: none;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn.primary {
  background: #1b9536;
  color: #fff;
  border-color: #1b9536;
}

.btn.ghost {
  background: #e6fff1;
  color: #1b9536;
  border-color: #a6e0bb;
}

.btn.link {
  background: transparent;
  color: #1b9536;
  padding-left: 0;
  padding-right: 0;
  border: none;
}

.hero-art .placeholder {
  aspect-ratio: 1 / 1;
  width: min(560px, 85vw);
  background: #eee;
  border: 1px dashed #cbd5d1;
  border-radius: 16px;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}

.placeholder .camera {
  font-size: 2rem;
  opacity: 0.7;
}
.placeholder .hint {
  position: absolute;
  bottom: 1rem;
  font-size: 0.95rem;
  color: #6b7972;
}

.features {
  max-width: 1100px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.features .card {
  background: #fff;
  border: 1px solid #cbe8d2;
  border-radius: 14px;
  padding: 1.1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.features .card h3 {
  color: #0c4a23;
  margin: 0 0 0.3rem;
}

.features .card p {
  color: #315343;
  margin: 0;
}

@media (max-width: 950px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 3.5rem;
  }
  .hero-art {
    order: -1;
  }
}
</style>
