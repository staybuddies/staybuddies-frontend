<template>
  <section class="steps" id="how-it-works">
    <p class="label">How It Works</p>
    <h2 class="heading">Simple Steps to Find Your Match</h2>
    <p class="subtext">
      Our process is designed to be easy, efficient, and effective in finding your ideal roommate.
    </p>
    <div class="steps-container">
      <div class="step">
        <div class="circle">1</div>
        <h3>Create Profile</h3>
        <p>Sign up and create your detailed profile with preferences and lifestyle information.</p>
      </div>
      <div class="step">
        <div class="circle">2</div>
        <h3>Take Quiz</h3>
        <p>Complete our comprehensive lifestyle and behavior quiz to help us understand your living habits.</p>
      </div>
      <div class="step">
        <div class="circle">3</div>
        <h3>Track Behavior</h3>
        <p>Use our behavior tracking tools to analyze your utility usage, noise patterns, and daily habits.</p>
      </div>
      <div class="step">
        <div class="circle">4</div>
        <h3>Get Matched</h3>
        <p>Receive personalized roommate matches based on compatibility scores and preferences.</p>
      </div>
    </div>
    
  </section>
</template>

<style scoped>
.steps {
  text-align: center;
  background-color: white;
  padding: 4rem 1rem;
}
.label {
  display: inline-block;
  background: #d4ff87;
  color: #1b9536;
  font-weight: bold;
  padding: 0.25rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.heading {
  font-size: 2rem;
  font-weight: 800;
  color: #1b9536;
  margin-bottom: 0.5rem;
}
.subtext {
  max-width: 600px;
  margin: 0 auto 2rem;
  color: #444;
  font-size: 1rem;
}
.steps-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}
.step {
  max-width: 250px;
  text-align: center;
}
.circle {
  width: 40px;
  height: 40px;
  background-color: #d4ff87;
  color: #1b9536;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1rem;
}
h3 {
  color: #1b9536;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.step p {
  color: #444;
  font-size: 0.9rem;
}

</style>
