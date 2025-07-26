<template>
  <section class="smart-matching" id="features">
    <p class="label">Features</p>
    <h2 class="heading">Smart Matching, Better Living</h2>
    <p class="subtext">
      Our platform goes beyond basic preferences to analyze behavior patterns and ensure compatible living situations.
    </p>
    <div class="features">
      <div class="feature">
        <div class="icon">👥</div>
        <h3>Lifestyle Matching</h3>
        <p>
          Our detailed lifestyle quiz helps match you with compatible roommates based on your habits and preferences.
        </p>
      </div>
      <div class="feature">
        <div class="icon">📊</div>
        <h3>Behavior Analysis</h3>
        <p>
          Track and analyze utility usage, noise levels, and other living habits to ensure compatibility.
        </p>
      </div>
      <div class="feature">
        <div class="icon">💬</div>
        <h3>Secure Messaging</h3>
        <p>
          Connect with potential roommates through our secure in-app messaging system before making any commitments.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.smart-matching {
  background-color: #faffd6;
  text-align: center;
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
.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 1rem;
}
.feature {
  background: white;
  border: 1px solid #1b9536;
  border-radius: 8px;
  padding: 2rem;
  width: 280px;
  text-align: left;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.icon {
  font-size: 2rem;
  background-color: #d4ff87;
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-bottom: 1rem;
}
h3 {
  color: #1b9536;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.feature p {
  color: #333;
  font-size: 0.95rem;
  line-height: 1.4;
}
</style>

