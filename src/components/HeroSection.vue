<script>
export default {
  methods: {
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="text-content">
          <h1 class="sentence">Find Your Perfect Roommate with AI-Powered Compatibility</h1>
          <p>Discover roommates who match your lifestyle, behavior, and preferences.</p>
          <div class="buttonn">
            <button class="button" @click="goToLogin">Take the quiz</button>
            <button class="button2">Learn More</button>
          </div>
        </div>
        <div class="image-placeholder"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: #faffd6;
  padding: 4rem 1rem;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  font-size: 2rem;
}

.text-content {
  flex: 1;
  min-width: 280px;
}

.image-placeholder {
  width: 500px;
  height: 600px;
  background-color: #ccc;
  flex-shrink: 0;
}

.sentence{
    color: #1B9536;
}

.buttonn {
  display: flex;
  gap: 1rem; 
  margin-top: 1rem;
}

.button {
  background-color: #1B9536;
  color: white;
  width: 160px;
  height: 40px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
}

.button2 {
  background-color: white;
  color: #1B9536;
  width: 160px;
  height: 40px;
  border: 2px solid #1B9536;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;

}

</style>
