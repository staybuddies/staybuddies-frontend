<template>
  <div class="admin-page">
    <AdminSidebar />

    <main class="main-content">
      <div class="page-head">
        <h1>User Details</h1>
        <RouterLink class="btn" to="/admin/users">Back to list</RouterLink>
      </div>

      <div class="content card">
        <div class="header header-flex">
          <div class="avatar">
            <img v-if="photoUrl" :src="photoUrl" alt="avatar" />
            <span v-else>{{ initial }}</span>
          </div>
          <div>
            <h2 class="tight">{{ user.name || "-" }}</h2>
            <div class="sub">{{ user.email }}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="field">
            <label>Email</label>
            <div class="value">{{ user.email }}</div>
          </div>
          <div class="field">
            <label>Phone</label>
            <div class="value">{{ user.phone || "—" }}</div>
          </div>
          <div class="field">
            <label>Join Date</label>
            <div class="value">{{ fmtDate(user.joinDate) }}</div>
          </div>
          <div class="field">
            <label>Status</label>
            <div class="value">
              <span :class="['badge', user.active ? 'active' : 'inactive']">
                {{ user.active ? "Active" : "Inactive" }}
              </span>
            </div>
          </div>
          <div class="field">
            <label>Gender</label>
            <div class="value">{{ user.gender || "—" }}</div>
          </div>
          <div class="field">
            <label>Age</label>
            <div class="value">{{ user.age ?? "—" }}</div>
          </div>
          <div class="field">
            <label>Location</label>
            <div class="value">{{ user.location || "—" }}</div>
          </div>
          <div class="field">
            <label>University</label>
            <div class="value">{{ user.university || "—" }}</div>
          </div>
          <div class="field">
            <label>Major</label>
            <div class="value">{{ user.major || "—" }}</div>
          </div>
          <div class="field full">
            <label>Bio</label>
            <div class="value">{{ user.bio || "—" }}</div>
          </div>
        </div>

        <div class="toolbar">
          <RouterLink class="btn" :to="`/admin/users/edit/${user.id}`"
            >Edit</RouterLink
          >
          <button class="btn danger" @click="removeUser">Delete</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import AdminSidebar from "@/pages/admin/AdminSidebar.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const user = ref({ id, email: "", active: false });
const photoUrl = computed(() => user.value.photoUrl || "");

const initial = computed(() => {
  const s = (user.value.name || user.value.email || "A").trim();
  return s ? s[0].toUpperCase() : "A";
});

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return d;
  }
}

async function fetchUser() {
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

    user.value = {
      id: data.id,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      joinDate: data.joinDate || "",
      active: data.active ?? false,
      gender: data.gender || "",
      age: data.age ?? null,
      location: data.location || "",
      university: data.university || "",
      major: data.major || "",
      bio: data.bio || "",
      photoUrl: data.photoUrl || "",
    };
  } catch (e) {
    console.error("Failed to fetch user", e);
    if (e.response?.status === 401 || e.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    }
  }
}

async function removeUser() {
  if (!confirm("Delete this user?")) return;
  try {
    const token = localStorage.getItem("adminToken");
    await axios.delete(`/api/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    router.replace("/admin/users");
  } catch (e) {
    console.error("Delete failed", e);
    alert("Failed to delete user");
  }
}

onMounted(fetchUser);
</script>

<style scoped>
.admin-page {
  display: flex;
}
.header-flex {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  overflow: hidden;
  background: #e6fff1;
  border: 1px solid #b8f1ce;
  display: grid;
  place-items: center;
  color: #1b9536;
  font-weight: 900;
  font-size: 1.6rem;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tight {
  margin: 0;
}
.sub {
  color: #64748b;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}
.field {
  background: #fbfdfb;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 0.75rem;
}
.field label {
  display: block;
  color: #475569;
  font-size: 0.88rem;
  margin-bottom: 0.2rem;
}
.field .value {
  color: #0c4a23;
  font-weight: 750;
}
.field.full {
  grid-column: 1/-1;
}
.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  border: 1px solid #e2e8f0;
}
.badge.active {
  background: #eafff5;
  color: #066a36;
  border-color: #b7f3d3;
}
.badge.inactive {
  background: #fff4f4;
  color: #7a1020;
  border-color: #f5c2c7;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-top: 12px;
}
.btn.danger {
  background: #dc2626;
  color: #fff;
}
</style>
