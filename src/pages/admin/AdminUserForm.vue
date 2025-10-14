<template>
  <div class="admin-page">
    <AdminSidebar />

    <main class="main-content">
      <div class="page-head">
        <h1>{{ isEdit ? "Edit User" : "Create User" }}</h1>
        <RouterLink class="btn" to="/admin/users">Back to list</RouterLink>
      </div>

      <div class="content card form-card">
        <div v-if="toast.success" class="alert success">
          {{ toast.success }}
        </div>
        <div v-if="toast.error" class="alert error">{{ toast.error }}</div>

        <form class="form" @submit.prevent="onSubmit">
          <div class="row">
            <label>Full Name</label>
            <input type="text" v-model.trim="form.name" required />
          </div>
          <div class="row">
            <label>Email</label>
            <input type="email" v-model.trim="form.email" required />
          </div>
          <div class="row">
            <label>Phone</label><input type="text" v-model.trim="form.phone" />
          </div>

          <div v-if="!isEdit" class="row">
            <label>Initial Password</label>
            <input type="password" v-model="form.password" />
            <div class="help">
              Set an initial password when creating a new user.
            </div>
          </div>

          <div class="row">
            <label>Gender</label>
            <input
              type="text"
              v-model.trim="form.gender"
              placeholder="Male / Female / Other"
            />
          </div>
          <div class="row">
            <label>Age</label>
            <input type="number" v-model.number="form.age" min="16" max="99" />
          </div>
          <div class="row">
            <label>Location</label>
            <input type="text" v-model.trim="form.location" />
          </div>
          <div class="row">
            <label>University</label>
            <input type="text" v-model.trim="form.university" />
          </div>
          <div class="row">
            <label>Major</label><input type="text" v-model.trim="form.major" />
          </div>
          <div class="row">
            <label>Bio</label>
            <textarea
              rows="4"
              v-model.trim="form.bio"
              placeholder="Short bio…"
            ></textarea>
          </div>
          <div class="row">
            <label>Already has room?</label>
            <input type="checkbox" v-model="form.alreadyHasRoom" />
          </div>

          <div class="row">
            <label>Profile Photo</label>
            <input type="file" accept="image/*" @change="onFile" />
            <div class="help">Optional. Upload or replace profile photo.</div>
          </div>

          <div class="actions">
            <button class="btn primary" type="submit" :disabled="saving">
              {{ saving ? "Saving…" : "Save" }}
            </button>
            <RouterLink class="btn ghost" to="/admin/users">Cancel</RouterLink>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import AdminSidebar from "@/pages/admin/AdminSidebar.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const id = route.params.id || null;
const isEdit = computed(() => !!id);

const form = reactive({
  id,
  name: "",
  email: "",
  phone: "",
  password: "",
  gender: "",
  age: null,
  location: "",
  university: "",
  major: "",
  bio: "",
  alreadyHasRoom: false,
});

const saving = ref(false);
const toast = reactive({ success: "", error: "" });
let fileBlob = null;

function onFile(e) {
  const input = e.target;
  fileBlob = input.files?.[0] ?? null;
}

async function loadForEdit() {
  if (!isEdit.value) return;

  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const { data } = await axios.get(`/api/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    Object.assign(form, {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      gender: data.gender || "",
      age: data.age ?? null,
      location: data.location || "",
      university: data.university || "",
      major: data.major || "",
      bio: data.bio || "",
      alreadyHasRoom: data.alreadyHasRoom || false,
    });
  } catch (e) {
    console.error("Failed to load user", e);
    if (e.response?.status === 401 || e.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    }
  }
}

async function onSubmit() {
  saving.value = true;
  toast.success = "";
  toast.error = "";

  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("email", form.email);
    if (form.phone) payload.append("phone", form.phone);
    if (!isEdit.value && form.password)
      payload.append("password", form.password);
    if (form.gender) payload.append("gender", form.gender);
    if (form.age !== null && form.age !== undefined)
      payload.append("age", String(form.age));
    if (form.location) payload.append("location", form.location);
    if (form.university) payload.append("university", form.university);
    if (form.major) payload.append("major", form.major);
    if (form.bio) payload.append("bio", form.bio);
    payload.append("alreadyHasRoom", String(form.alreadyHasRoom));
    if (fileBlob) payload.append("file", fileBlob);

    const url = isEdit.value ? `/api/admin/users/${id}` : "/api/admin/users";

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    if (isEdit.value) {
      await axios.put(url, payload, config);
    } else {
      await axios.post(url, payload, config);
    }

    toast.success = "Saved!";
    setTimeout(() => {
      router.replace("/admin/users");
    }, 1000);
  } catch (e) {
    console.error("Save failed", e);
    toast.error = e.response?.data?.message || e.message || "Error saving";

    if (e.response?.status === 401 || e.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    }
  } finally {
    saving.value = false;
  }
}

onMounted(loadForEdit);
</script>

<style scoped>
.admin-page {
  display: flex;
}
.form-card .row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}
.form-card .help {
  color: #64748b;
  font-size: 0.9rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.alert.success {
  background: #eafff5;
  border: 1px solid #b7f3d3;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  color: #066a36;
  margin-bottom: 1rem;
}
.alert.error {
  background: #fff1f0;
  border: 1px solid #f5c2c7;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  color: #b91c1c;
  margin-bottom: 1rem;
}
</style>
