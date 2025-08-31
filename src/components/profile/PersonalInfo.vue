<template>
  <div>
    <div v-if="loading" class="loading">Loading…</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- HERO: big photo on the left, identity on the right -->
    <section v-if="!loading" class="hero-card">
      <div class="hero-grid">
        <!-- Photo -->
        <div class="hero-photo">
          <!-- If photo exists, show image + EDIT button -->
          <template v-if="photoUrl">
            <img :src="photoUrl" alt="profile photo" />
            <button class="btn edit" :disabled="busyPhoto" @click="pick">
              {{ busyPhoto ? "Uploading…" : "Edit Photo" }}
            </button>
          </template>

          <!-- Else: placeholder + UPLOAD button -->
          <div v-else class="hero-placeholder">
            <span class="initial">{{ initial }}</span>
            <button class="btn upload" :disabled="busyPhoto" @click="pick">
              {{ busyPhoto ? "Uploading…" : "Upload Photo" }}
            </button>
          </div>

          <!-- hidden input -->
          <input
            ref="fileEl"
            type="file"
            accept="image/*"
            @change="onPick"
            hidden
          />
        </div>

        <!-- Identity -->
        <div class="hero-info">
          <h1 class="hero-title">{{ form.name || "-" }}</h1>
          <p class="hero-sub">
            <span v-if="form.location" class="row"
              ><i>📍</i>{{ form.location }}</span
            >
            <span v-if="form.age" class="row"><i>🎂</i>{{ form.age }}</span>
            <span v-if="form.gender" class="row"
              ><i>🧑</i>{{ form.gender }}</span
            >
          </p>

          <div class="bullets">
            <div v-if="form.university" class="bullet">
              <i>🎓</i>{{ form.university }}
            </div>
            <div v-if="form.major" class="bullet">
              <i>📘</i>{{ form.major }}
            </div>
          </div>

          <p class="desc" v-if="form.bio"><b>About:</b> {{ form.bio }}</p>
          <p class="desc muted" v-else>
            Write a short bio to help others know you.
          </p>

          <div v-if="!photoUrl" class="hint">
            Tip: Add a photo so your profile stands out.
          </div>
        </div>
      </div>
    </section>

    <!-- Personal info form (same fields) -->
    <form v-if="!loading" @submit.prevent="savePersonal" class="form-card">
      <div class="grid">
        <label>Full Name <input v-model.trim="form.name" required /></label>
        <label
          >Email <input v-model.trim="form.email" type="email" disabled
        /></label>

        <label>Phone <input v-model.trim="form.phone" required /></label>
        <label>
          Gender
          <select v-model="form.gender">
            <option value="">—</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>

        <label
          >Age <input v-model.number="form.age" type="number" min="16" max="99"
        /></label>
        <label>Location <input v-model.trim="form.location" /></label>

        <label>University <input v-model.trim="form.university" /></label>
        <label
          >Major / Field of Study <input v-model.trim="form.major"
        /></label>

        <label class="span-2">
          Bio
          <textarea
            v-model.trim="form.bio"
            rows="4"
            placeholder="Tell others about yourself"
          ></textarea>
        </label>

        <label class="checkbox">
          <input type="checkbox" v-model="form.alreadyHasRoom" />
          Already have a room
        </label>

        <label>
          Change Password (optional)
          <input
            v-model="password"
            type="password"
            placeholder="New password"
          />
        </label>
      </div>

      <button class="primary">Save Changes</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import api from "@/api";

const loading = ref(true);
const error = ref("");
const password = ref("");

const form = reactive({
  id: null,
  name: "",
  email: "",
  phone: "",
  gender: "",
  age: null,
  location: "",
  university: "",
  major: "",
  bio: "",
  alreadyHasRoom: false,
});

const photoUrl = ref(""); // photo url if exists
const busyPhoto = ref(false); // uploading flag
const fileEl = ref(null);

const initial = computed(() =>
  (form.name || form.email || "?").charAt(0).toUpperCase()
);

onMounted(fetchProfile);

async function fetchProfile() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/room-finder/me");
    Object.assign(form, data);
    form.major = data.major ?? "";
    form.bio = data.bio ?? "";

    try {
      const r = await api.get("/room-finder/me/photo");
      photoUrl.value = r.data?.url || "";
    } catch {
      photoUrl.value = ""; // ok if none yet
    }
  } catch (e) {
    error.value = "Could not load profile.";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function pick() {
  fileEl.value?.click();
}

async function onPick(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  busyPhoto.value = true;
  try {
    const fd = new FormData();
    fd.append("file", file);
    const r = await api.post("/room-finder/me/photo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      // params: { storage: "local" }, // for local dev
    });
    photoUrl.value = r.data?.url || "";
  } catch (err) {
    console.error(err);
    alert("Photo upload failed.");
  } finally {
    e.target.value = "";
    busyPhoto.value = false;
  }
}

async function savePersonal() {
  try {
    await api.put("/room-finder/me", {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      age: form.age,
      location: form.location,
      university: form.university,
      major: form.major,
      bio: form.bio,
      alreadyHasRoom: form.alreadyHasRoom,
      password: password.value || null,
    });
    password.value = "";
    await fetchProfile();
    alert("Saved.");
  } catch (e) {
    alert("Failed to save profile");
    console.error(e);
  }
}
</script>

<style scoped>
/* Hero card (big photo left, details right) */
.hero-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.25rem;
  font-size: 1.02rem; /* base text a touch bigger */
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(260px, 540px) 1fr;
  gap: 1.25rem;
  align-items: start;
}
.hero-photo {
  position: relative;
  aspect-ratio: 4 / 3;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e8f3ea;
}
.hero-photo > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  position: relative;
}
.initial {
  width: 100px;
  height: 100px;
  border-radius: 999px;
  background: #e6fff1;
  color: #1b9536;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 2.4rem; /* bigger */
  border: 1px solid #b8f1ce;
}
.btn.upload,
.btn.edit {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #1b9536;
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(27, 149, 54, 0.25);
}
.btn.upload[disabled],
.btn.edit[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

.hero-info {
  padding-top: 0.2rem;
}
.hero-title {
  margin: 0;
  font-size: clamp(2.6rem, 3.8vw, 3.2rem); /* larger */
  font-weight: 1000;
  color: #0c4a23;
}
.hero-sub {
  margin: 0.65rem 0 0.95rem;
  color: #3d3d3d;
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  font-size: 1.1rem; /* larger */
}
.hero-sub .row i {
  margin-right: 0.45rem;
}
.bullets {
  display: grid;
  gap: 0.45rem;
  margin-bottom: 0.7rem;
}
.bullet {
  color: #0c4a23;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 1.06rem;
}
.desc {
  color: #344054;
  line-height: 1.55;
  font-size: 1.06rem;
}
.muted {
  color: #667085;
}
.hint {
  color: #666;
  margin-top: 0.45rem;
}

/* Form card */
.form-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 1.1rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  font-size: 1.02rem; /* slightly bigger body text */
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}
.span-2 {
  grid-column: 1 / -1;
}
label {
  display: flex;
  flex-direction: column;
  font-weight: 750;
  color: #0c4a23;
  font-size: 1.02rem;
}
input,
select,
textarea {
  margin-top: 0.4rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid #1b9536;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}
.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.55rem;
  font-weight: 650;
}
.primary {
  margin-top: 1rem;
  padding: 0.9rem 1.3rem;
  background: #1b9536;
  color: #fff;
  border: 0;
  border-radius: 8px;
  font-weight: 800;
  font-size: 1.02rem;
  cursor: pointer;
}
.loading {
  color: #666;
}
.error {
  color: #c92a2a;
  margin-bottom: 0.25rem;
}

@media (max-width: 980px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: auto;
  }
}
</style>
