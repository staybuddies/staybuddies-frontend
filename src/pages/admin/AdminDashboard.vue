<template>
  <div class="layout admin-bg">
    <AdminSidebar />

    <main class="main content">
      <header class="dashboard-header">
        <div class="header-row">
          <h1 class="title">Admin Dashboard</h1>

          <div class="range-form">
            <select v-model="range" class="select" @change="reload">
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="QUARTER">This Quarter</option>
              <option value="YEAR">This Year</option>
            </select>
            <button class="btn btn-ghost" type="button" @click="reload">
              Apply
            </button>
          </div>
        </div>

        <p class="subtitle">Welcome back! Here's what's happening today.</p>
        <div class="alerts">
          <div v-if="error" class="alert error">{{ error }}</div>
        </div>
      </header>

      <!-- KPI cards -->
      <section class="cards">
        <article class="card kpi">
          <h3>Total Users</h3>
          <p>{{ metrics.totalUsers ?? 0 }}</p>
          <small class="muted">{{ metrics.totalUsersDelta ?? "—" }}</small>
        </article>
        <article class="card kpi">
          <h3>Active Users</h3>
          <p>{{ metrics.activeUsers ?? 0 }}</p>
          <small class="muted">{{ metrics.activeUsersNote ?? "—" }}</small>
        </article>
        <article class="card kpi">
          <h3>Matches Made</h3>
          <p>{{ metrics.matchesMade ?? 0 }}</p>
          <small class="muted">{{ metrics.matchRateNote ?? "—" }}</small>
        </article>
        <article class="card kpi">
          <h3>New Users Today</h3>
          <p>{{ metrics.newUsersToday ?? 0 }}</p>
          <small class="muted">{{ metrics.newUsersDelta ?? "—" }}</small>
        </article>
      </section>

      <!-- Growth -->
      <section class="panel growth-panel">
        <div class="panel-head">
          <h2>User Growth</h2>
          <div class="range-form">
            <select v-model="range" class="select" @change="reload">
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="QUARTER">This Quarter</option>
              <option value="YEAR">This Year</option>
            </select>
            <button class="btn btn-ghost" type="button" @click="reload">
              Apply
            </button>
          </div>
        </div>

        <div class="chart-wrap"><canvas ref="chartEl" /></div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import AdminSidebar from "@/pages/admin/AdminSidebar.vue";
import axios from "axios";

const router = useRouter();

const range = ref("WEEK");
const metrics = reactive({});
const error = ref("");
const chartEl = ref(null);
let chart = null;

async function fetchAdminDashboard(r) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    router.push("/admin/login");
    throw new Error("No admin token");
  }

  console.log("📤 Sending token:", token.substring(0, 30) + "..."); // ⭐ ADD THIS

  const res = await axios.get("/api/admin/dashboard", {
    params: { range: r },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

async function reload() {
  try {
    error.value = "";
    const data = await fetchAdminDashboard(range.value);
    Object.assign(metrics, data || {});
    await drawChart(metrics.growthLabels || [], metrics.growthValues || []);
  } catch (e) {
    console.error("Dashboard load failed:", e);

    if (e.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    } else {
      error.value = "Failed to load dashboard.";
    }
  }
}

async function drawChart(labels, values) {
  const { default: Chart } = await import("chart.js/auto");
  if (!chartEl.value) return;
  if (chart) {
    chart.destroy();
    chart = null;
  }

  chart = new Chart(chartEl.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "New users",
          data: values,
          tension: 0.35,
          fill: false,
          borderColor: "#1b9536",
          backgroundColor: "#1b9536",
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
      maintainAspectRatio: false,
    },
  });
}

onMounted(() => {
  console.log("AdminDashboard mounted");
  console.log("Token exists:", !!localStorage.getItem("adminToken"));
  reload();
});

onBeforeUnmount(() => {
  if (chart) chart.destroy();
});
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}
.admin-bg {
  background: #f7faf9;
}
.main.content {
  padding: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dashboard-header .title {
  font: 800 28px/1.2 Inter, system-ui, -apple-system, Segoe UI, Roboto,
    sans-serif;
  color: #0f6130;
  margin: 0;
}
.subtitle {
  color: #475569;
  margin: 6px 0 12px;
}
.alerts {
  margin-top: 6px;
}
.alert {
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 700;
  margin: 8px 0;
}
.alert.error {
  background: #fdecea;
  color: #b71c1c;
  border: 1px solid #ffc9c9;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin: 12px 0 18px;
}
.card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
}
.kpi h3 {
  margin: 0 0 6px;
  color: #0f172a;
  font-weight: 800;
}
.kpi p {
  margin: 0;
  font: 800 24px/1 Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #0f172a;
}
.muted {
  color: #64748b;
}

.panel {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
}
.growth-panel {
  background: #f4fff7;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;
  background: #fff;
}
.btn-ghost {
  background: transparent;
}
.btn-primary {
  background: #1b9536;
  color: #fff;
  border-color: #1b9536;
}
.select {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 10px;
}
.range-form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chart-wrap canvas {
  width: 100% !important;
  height: 320px !important;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .main.content {
    padding: 12px;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .dashboard-header .title {
    font-size: 24px;
  }

  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
