<template>
  <div class="layout">
    <AdminSidebar />

    <main class="main">
      <div class="content">
        <header class="page-head">
          <h1>Report & Moderation</h1>
          <div class="status-summary" v-if="!loading">
            <span>Total: {{ page?.totalElements || 0 }}</span>
          </div>
        </header>

        <section class="panel">
          <form class="filters" @submit.prevent="applyFilters">
            <div class="filter-group">
              <label for="status-filter">Status:</label>
              <select id="status-filter" v-model="status">
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <button type="submit" class="btn primary">Apply Filter</button>
            <button
              v-if="status"
              type="button"
              class="btn secondary"
              @click="clearFilters"
            >
              Clear
            </button>
          </form>

          <!-- Active Filter Indicator -->
          <div v-if="status" class="active-filter">
            <span class="filter-tag">
              Status: <strong>{{ status }}</strong>
              <button type="button" @click="clearFilters" class="remove-filter">
                ×
              </button>
            </span>
          </div>

          <div class="table-wrap">
            <table class="grid">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reporter</th>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="loading">
                  <td class="empty loading" colspan="7">Loading reports...</td>
                </tr>

                <tr v-else-if="reports.length === 0">
                  <td class="empty" colspan="7">
                    {{
                      status
                        ? `No reports with status "${status}"`
                        : "No reports found."
                    }}
                  </td>
                </tr>

                <tr v-else v-for="r in reports" :key="r.id">
                  <td>{{ r.id }}</td>
                  <td>
                    <div class="user-info">
                      <div>{{ r.reporterName || "—" }}</div>
                      <small v-if="r.reporterEmail">{{
                        r.reporterEmail
                      }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="user-info">
                      <div>{{ r.targetName || "—" }}</div>
                      <small v-if="r.targetUserEmail">{{
                        r.targetUserEmail
                      }}</small>
                    </div>
                  </td>

                  <td>
                    <div class="reason-cell">
                      <strong>{{ r.reason || "—" }}</strong>
                      <small v-if="r.details">{{ r.details }}</small>
                    </div>
                  </td>

                  <td>
                    <span class="badge" :class="statusClass(r.status)">
                      {{ formatStatus(r.status) }}
                    </span>
                  </td>

                  <td>{{ fmtDate(r.createdAt) }}</td>

                  <td>
                    <details class="action-menu">
                      <summary class="btn small">Actions ▾</summary>
                      <div class="menu">
                        <button type="button" @click="updateStatus(r, 'OPEN')">
                          Mark OPEN
                        </button>
                        <button
                          type="button"
                          @click="updateStatus(r, 'IN_REVIEW')"
                        >
                          Mark IN_REVIEW
                        </button>
                        <button
                          type="button"
                          @click="updateStatus(r, 'RESOLVED')"
                        >
                          Mark RESOLVED
                        </button>
                        <hr />
                        <button
                          type="button"
                          class="danger"
                          @click="openSuspendModal(r)"
                        >
                          Suspend Target User
                        </button>
                      </div>
                    </details>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination" v-if="page != null && page.totalPages > 0">
            <div class="pagination-info">
              Showing
              <strong>{{ page.number * page.size + 1 }}</strong>
              to
              <strong>{{
                Math.min((page.number + 1) * page.size, page.totalElements)
              }}</strong>
              of
              <strong>{{ page.totalElements }}</strong>
              reports
            </div>
            <div class="pagination-nav">
              <span class="page-indicator">
                Page {{ page.number + 1 }} of {{ page.totalPages }}
              </span>
              <div class="buttons">
                <button
                  class="btn"
                  :disabled="page.first"
                  @click="goto(page.number - 1)"
                >
                  ← Prev
                </button>
                <button
                  class="btn"
                  :disabled="page.last"
                  @click="goto(page.number + 1)"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Suspend Modal -->
    <div
      v-if="showSuspendModal"
      class="modal-overlay"
      @click.self="closeSuspendModal"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>Suspend User</h2>
          <button class="close-btn" @click="closeSuspendModal">×</button>
        </div>
        <div class="modal-body">
          <p>
            You are about to suspend
            <strong>{{ selectedReport?.targetName }}</strong>
            ({{ selectedReport?.targetUserEmail }})
          </p>
          <p class="warning">
            ⚠️ The user will be notified via email and their account will be
            deactivated immediately.
          </p>
          <label for="suspend-reason">Suspension Reason:</label>
          <textarea
            id="suspend-reason"
            v-model="suspendReason"
            rows="4"
            placeholder="Enter the reason for suspension (will be sent to the user via email)..."
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="closeSuspendModal">Cancel</button>
          <button class="btn danger" @click="confirmSuspend">
            Suspend User
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminSidebar from "@/pages/admin/AdminSidebar.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const pageNum = ref(Number(route.query.page ?? 0));
const size = ref(Number(route.query.size ?? 20));
const status = ref(route.query.status ?? "");

const reports = ref([]);
const page = ref(null);
const loading = ref(false);

const showSuspendModal = ref(false);
const selectedReport = ref(null);
const suspendReason = ref("");

// Watch for route changes to update filters
watch(
  () => route.query,
  (newQuery) => {
    status.value = newQuery.status ?? "";
    pageNum.value = Number(newQuery.page ?? 0);
    size.value = Number(newQuery.size ?? 20);
  },
  { immediate: false }
);

function syncQuery() {
  const query = {
    page: String(pageNum.value),
    size: String(size.value),
  };

  if (status.value) {
    query.status = status.value;
  }

  router.replace({ query });
}

async function fetchReports() {
  loading.value = true;
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const params = {
      page: pageNum.value,
      size: size.value,
    };

    if (status.value) {
      params.status = status.value;
    }

    const { data } = await axios.get("/api/admin/reports", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    reports.value = data.content || [];
    page.value = {
      number: data.number || 0,
      size: data.size || size.value,
      totalPages: data.totalPages || 1,
      totalElements: data.totalElements || 0,
      first: data.first || false,
      last: data.last || false,
    };
  } catch (e) {
    console.error("Failed to fetch reports", e);
    if (e.response?.status === 401 || e.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    }
    reports.value = [];
    page.value = {
      number: 0,
      size: size.value,
      totalPages: 1,
      totalElements: 0,
      first: true,
      last: true,
    };
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  pageNum.value = 0; // Reset to first page when filtering
  syncQuery();
  fetchReports();
}

function clearFilters() {
  status.value = "";
  pageNum.value = 0;
  syncQuery();
  fetchReports();
}

function goto(n) {
  if (!page.value) return;
  if (n < 0 || n >= page.value.totalPages) return;
  pageNum.value = n;
  syncQuery();
  fetchReports();
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().slice(0, 16).replace("T", " ");
  } catch {
    return d;
  }
}

function formatStatus(s) {
  if (!s) return "—";
  return s.replace(/_/g, " ");
}

function statusClass(s) {
  if (s === "OPEN") return "status-open";
  if (s === "IN_REVIEW") return "status-review";
  if (s === "RESOLVED") return "status-resolved";
  return "muted";
}

async function updateStatus(r, newStatus) {
  try {
    const token = localStorage.getItem("adminToken");

    await axios.post(`/api/admin/reports/${r.id}/status`, null, {
      params: { status: newStatus },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchReports();
  } catch (e) {
    console.error("Failed to update status", e);
    if (e.response?.status === 401 || e.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    } else {
      alert("Could not update status.");
    }
  }
}

function openSuspendModal(report) {
  selectedReport.value = report;
  suspendReason.value =
    "Your account has been suspended due to reports from other users violating our community guidelines.";
  showSuspendModal.value = true;
}

function closeSuspendModal() {
  showSuspendModal.value = false;
  selectedReport.value = null;
  suspendReason.value = "";
}

async function confirmSuspend() {
  if (!selectedReport.value) return;

  if (
    !confirm(
      `Are you sure you want to suspend ${selectedReport.value.targetName}? An email will be sent to notify them.`
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("adminToken");
    await axios.post(
      `/api/admin/reports/${selectedReport.value.id}/suspend-target`,
      {
        reason: suspendReason.value || "Violation of community guidelines",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("User suspended successfully. Email notification sent.");
    closeSuspendModal();
    fetchReports();
  } catch (e) {
    console.error("Failed to suspend user", e);
    if (e.response?.status === 401 || e.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    } else {
      alert(
        "Failed to suspend user: " + (e.response?.data?.message || e.message)
      );
    }
  }
}

onMounted(fetchReports);
</script>

<style scoped>
.layout {
  display: flex;
}
.main {
  flex: 1;
  padding: 24px;
}
.content {
  max-width: 1400px;
  margin: 0 auto;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 20px;
}
.page-head h1 {
  margin: 0;
  font-size: 1.75rem;
}

.status-summary {
  display: flex;
  gap: 16px;
  color: #64748b;
  font-size: 0.95rem;
}

.panel {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.filters select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 0.95rem;
  min-width: 180px;
  cursor: pointer;
}

.filters select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.active-filter {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  color: #1e40af;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  border: 1px solid #bfdbfe;
}

.remove-filter {
  background: none;
  border: none;
  color: #1e40af;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  line-height: 1;
}

.remove-filter:hover {
  color: #1e3a8a;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.15s;
}

.btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn.primary {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn.secondary {
  background: #6b7280;
  color: #fff;
  border-color: #6b7280;
}

.btn.secondary:hover {
  background: #4b5563;
  border-color: #4b5563;
}

.btn.small {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn.danger {
  background: #dc2626;
  color: #fff;
  border-color: #dc2626;
}

.btn.danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.table-wrap {
  overflow-x: auto;
  margin-bottom: 20px;
}

.grid {
  width: 100%;
  border-collapse: collapse;
}

.grid th,
.grid td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
  text-align: left;
}

.grid thead th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.grid tbody tr:hover {
  background: #f9fafb;
}

.empty {
  color: #6b7280;
  text-align: center;
  padding: 2rem;
  font-style: italic;
}

.empty.loading {
  font-style: normal;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info small {
  color: #6b7280;
  font-size: 0.8rem;
}

.reason-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 300px;
}

.reason-cell strong {
  color: #111827;
}

.reason-cell small {
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.4;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.status-open {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.badge.status-review {
  background: #dbeafe;
  color: #1e40af;
  border-color: #93c5fd;
}

.badge.status-resolved {
  background: #d1fae5;
  color: #065f46;
  border-color: #6ee7b7;
}

.badge.muted {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

.action-menu {
  position: relative;
  z-index: 1;
}

.action-menu summary {
  list-style: none;
  cursor: pointer;
}

.action-menu[open] {
  z-index: 100;
}

.action-menu[open] summary {
  background: #f3f4f6;
  position: relative;
  z-index: 101;
}

.action-menu .menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 999;
  min-width: 200px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.action-menu .menu button {
  background: none;
  border: none;
  text-align: left;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.action-menu .menu button:hover {
  background: #f3f4f6;
}

.action-menu .menu hr {
  margin: 4px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.action-menu .menu .danger {
  color: #dc2626;
  font-weight: 500;
}

.action-menu .menu .danger:hover {
  background: #fee2e2;
}

.pagination {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.pagination-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-indicator {
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

.buttons {
  display: flex;
  gap: 8px;
}

.buttons .btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f3f4f6;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem;
  color: #374151;
}

.modal-body .warning {
  background: #fef3c7;
  color: #92400e;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fde68a;
  font-size: 0.9rem;
}

.modal-body label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.modal-body textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.15s;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
