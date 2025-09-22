<template>
  <section id="about-us" class="about">
    <div class="wrap">
      <header class="head">
        <h2>About Us</h2>
        <p class="tagline">
          Two builders, one mission: better roommate matches.
        </p>
      </header>

      <ul class="team">
        <li class="card">
          <div class="avatar" aria-hidden="true">ZW</div>
          <div class="body">
            <h3 class="name">Zwe Nyan Win</h3>
            <p class="meta">
              ID&nbsp;–&nbsp;<strong>6540179</strong> · Java Spring Boot Backend
              Developer
            </p>
            <p class="bio">
              Designs and maintains the backend: matching logic, messaging,
              security, and real-time notifications. Loves clean architecture
              and shipping reliable APIs.
            </p>
          </div>
        </li>

        <li class="card">
          <div class="avatar" aria-hidden="true">SP</div>
          <div class="body">
            <h3 class="name">Su Phyu Sin</h3>
            <p class="meta">
              ID&nbsp;–&nbsp;<strong>6540146</strong> · Vue Frontend Developer
            </p>
            <p class="bio">
              Crafts the UI/UX and frontend architecture: Vue, routing, state,
              and accessibility. Focused on fast, friendly flows that feel great
              on any device.
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
// presentational only
</script>

<style scoped>
.about {
  scroll-margin-top: 84px;
  background: #fafef7;
  border-top: 1px solid #eef4ef;
  border-bottom: 1px solid #eef4ef;
}

/* wider container and more vertical breathing room */
.wrap {
  max-width: 1200px; /* was 1100px */
  margin: 0 auto;
  padding: 56px 20px; /* was 40px 16px */
}

.head {
  text-align: center;
  margin-bottom: 28px; /* was 22px */
}
.head h2 {
  margin: 0 0 8px;
  font-size: 2.25rem; /* was 2rem */
  color: #0f6130;
  letter-spacing: 0.2px;
}
.tagline {
  margin: 0;
  color: #486257;
  font-size: 1.05rem; /* a touch larger */
}

/* bigger grid with more spacing */
.team {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px; /* was 14px */
}

/* card scaled up */
.card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px; /* was 14px */
  padding: 22px; /* was 14px */
  background: #fff;
  border: 1px solid #e7efe9;
  border-radius: 16px; /* was 14px */
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
}

/* larger avatar block */
.avatar {
  width: 84px; /* was 60px */
  height: 84px; /* was 60px */
  border-radius: 16px; /* was 14px */
  display: grid;
  place-items: center;
  background: #e6fff1;
  color: #1b7f3a;
  font-weight: 900;
  letter-spacing: 0.6px;
  font-size: 1.35rem; /* show initials bigger */
}

/* bigger typography */
.name {
  margin: 4px 0 4px;
  color: #0f6130;
  font-size: 1.4rem; /* was default */
}
.meta {
  margin: 0 0 10px;
  color: #5b6f65;
  font-size: 1.02rem; /* was .95rem */
}
.bio {
  margin: 0;
  color: #274136;
  line-height: 1.55; /* was 1.45 */
  font-size: 1.02rem;
}

/* mobile: still single column, but keep the larger feel without overflow */
@media (max-width: 760px) {
  .team {
    grid-template-columns: 1fr;
  }
  .card {
    grid-template-columns: 1fr; /* stack avatar on top */
    text-align: center;
  }
  .avatar {
    margin: 0 auto 8px;
  }
}
</style>
