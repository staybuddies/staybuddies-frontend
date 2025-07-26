<template>
  <section class="testimonials" id="testimonials">
    <p class="label">Testimonials</p>
    <h2 class="heading">What Our Users Say</h2>
    <p class="subtext">
      Hear from students who found their perfect roommate match through our platform.
    </p>
    <div class="cards">
      <div class="card">
        <p class="quote">
          "The behavior analysis feature was a game-changer. I found a roommate who has similar utility usage habits, and we’ve never had an argument about bills!"
        </p>
        <div class="user">
          <div class="avatar">A</div>
          <div>
            <strong>Alex Johnson</strong><br />
            <span>UCLA Student</span>
          </div>
        </div>
      </div>
      <div class="card">
        <p class="quote">
          "The lifestyle quiz matched me with someone who has the same study habits and sleep schedule. It’s been the most peaceful living situation I’ve ever had."
        </p>
        <div class="user">
          <div class="avatar">S</div>
          <div>
            <strong>Samantha Lee</strong><br />
            <span>NYU Student</span>
          </div>
        </div>
      </div>
      <div class="card">
        <p class="quote">
          "I was skeptical at first, but the behavior tracking dashboard really helped me understand my own habits and find someone compatible."
        </p>
        <div class="user">
          <div class="avatar">M</div>
          <div>
            <strong>Marcus Williams</strong><br />
            <span>UMich Student</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials {
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
.cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}
.card {
  background: #fff;
  padding: 2rem;
  border: 1px solid #1b9536;
  border-radius: 8px;
  width: 300px;
  text-align: left;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.quote {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 1.5rem;
}
.user {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.avatar {
  background-color: #d4ff87;
  color: #1b9536;
  font-weight: bold;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
strong {
  color: #1b9536;
}
span {
  font-size: 0.85rem;
  color: #666;
}
</style>
