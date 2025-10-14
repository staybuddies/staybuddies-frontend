<template>
  <div class="admin-page">
    <AdminSidebar />

    <main class="main-content">
      <div class="page-head">
        <h1>User Management</h1>
        <div class="page-tools">
          <form class="search" @submit.prevent="applySearch">
            <input type="text" v-model="keyword" placeholder="Search user…" />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>

      <div class="content card">
        <div class="grid data-table user-table">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>
                  <button class="linklike" @click="toggleSort('joinDate')">
                    Join Date <small>({{ dir.toUpperCase() }})</small>
                  </button>
                </th>
                <th>Status</th>
                <th>Email verified</th>
                <th>Student-ID</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>
                  <div class="email">{{ u.email }}</div>
                  <div class="meta">{{ u.name || "—" }}</div>
                </td>

                <td>{{ fmtDate(u.joinDate) }}</td>

                <td>
                  <span :class="['badge', u.active ? 'active' : 'inactive']">
                    {{ u.active ? "Active" : "Inactive" }}
                  </span>
                </td>

                <td>
                  <span :class="['badge', u.emailVerified ? 'ok' : 'warn']">
                    {{ u.emailVerified ? "Verified" : "Not verified" }}
                  </span>
                </td>

                <td>
                  <span
                    v-if="u.idvStatus"
                    :class="[
                      'badge',
                      u.idvStatus === 'VERIFIED'
                        ? 'ok'
                        : u.idvStatus === 'PENDING'
                        ? 'warn'
                        : u.idvStatus === 'REJECTED'
                        ? 'danger'
                        : 'muted',
                    ]"
                  >
                    {{ u.idvStatus }}
                  </span>
                  <span v-else class="badge muted">—</span>
                </td>

                <td>
                  <details class="action-menu">
                    <summary class="btn small">Action ▾</summary>
                    <div class="menu">
                      <RouterLink :to="`/admin/users/view/${u.id}`"
                        >View Profile</RouterLink
                      >
                      <a
                        v-if="u.active"
                        href="#"
                        @click.prevent="openSuspendModal(u)"
                        >Suspend</a
                      >
                      <a v-else href="#" @click.prevent="activate(u)"
                        >Activate</a
                      >
                      <a class="danger" href="#" @click.prevent="removeUser(u)"
                        >Delete</a
                      >
                    </div>
                  </details>
                </td>
              </tr>

              <tr v-if="!loading && users.length === 0">
                <td colspan="6" class="empty">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pageData" class="pagination">
          <div>
            Showing
            <b>{{
              pageData.number * pageData.size + (users.length ? 1 : 0)
            }}</b>
            -
            <b>{{ pageData.number * pageData.size + users.length }}</b>
            of <b>{{ pageData.totalElements }}</b> users
          </div>
          <div class="buttons">
            <button
              class="btn"
              :class="{ disabled: pageData.first }"
              :aria-disabled="pageData.first"
              @click="gotoPage(pageData.number - 1)"
            >
              Previous
            </button>
            <button
              class="btn"
              :class="{ disabled: pageData.last }"
              :aria-disabled="pageData.last"
              @click="gotoPage(pageData.number + 1)"
            >
              Next
            </button>
          </div>
        </div>
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
            <strong>{{ selectedUser?.name || selectedUser?.email }}</strong>
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
import { onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import AdminSidebar from "@/pages/admin/AdminSidebar.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const users = ref([]);
const pageData = ref(null);
const loading = ref(false);

const page = ref(Number(route.query.page ?? 0));
const size = ref(Number(route.query.size ?? 10));
const sort = ref(route.query.sort ?? "joinDate");
const dir = ref(route.query.dir ?? "desc");
const keyword = ref(route.query.keyword ?? "");

const showSuspendModal = ref(false);
const selectedUser = ref(null);
const suspendReason = ref("");

function syncQuery() {
  router.replace({
    query: {
      page: String(page.value),
      size: String(size.value),
      sort: sort.value,
      dir: dir.value,
      keyword: keyword.value || undefined,
    },
  });
}

async function fetchUsers() {
  loading.value = true;
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const { data } = await axios.get("/api/admin/users", {
      params: {
        page: page.value,
        size: size.value,
        sort: sort.value,
        dir: dir.value,
        keyword: keyword.value || "",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    users.value = data.content || [];
    pageData.value = {
      number: data.number || 0,
      size: data.size || size.value,
      totalElements: data.totalElements || 0,
      first: data.first || false,
      last: data.last || false,
    };
  } catch (e) {
    console.error("Failed to fetch users", e);
    if (e.response?.status === 401 || e.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    }
  } finally {
    loading.value = false;
  }
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return d;
  }
}

function toggleSort(col) {
  if (sort.value === col) {
    dir.value = dir.value === "asc" ? "desc" : "asc";
  } else {
    sort.value = col;
    dir.value = "asc";
  }
  page.value = 0;
  syncQuery();
  fetchUsers();
}

function gotoPage(p) {
  if (!pageData.value) return;
  if (p < 0) return;
  page.value = p;
  syncQuery();
  fetchUsers();
}

function applySearch() {
  page.value = 0;
  syncQuery();
  fetchUsers();
}

function openSuspendModal(user) {
  selectedUser.value = user;
  suspendReason.value = "Violation of terms of service";
  showSuspendModal.value = true;
}

function closeSuspendModal() {
  showSuspendModal.value = false;
  selectedUser.value = null;
  suspendReason.value = "";
}

async function confirmSuspend() {
  if (!selectedUser.value) return;

  try {
    const token = localStorage.getItem("adminToken");
    await axios.post(
      `/api/admin/users/${selectedUser.value.id}/suspend`,
      {
        reason: suspendReason.value || "Violation of terms of service",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert(
      `User suspended successfully. Email notification sent to ${selectedUser.value.email}`
    );
    closeSuspendModal();
    fetchUsers();
  } catch (e) {
    console.error("Suspend failed", e);
    alert("Failed to suspend user");
  }
}

async function activate(u) {
  if (!confirm(`Activate ${u.email}?`)) return;
  try {
    const token = localStorage.getItem("adminToken");
    await axios.post(
      `/api/admin/users/${u.id}/activate`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert(`User activated. Email notification sent to ${u.email}`);
    fetchUsers();
  } catch (e) {
    console.error("Activate failed", e);
    alert("Failed to activate user");
  }
}

async function removeUser(u) {
  if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
  try {
    const token = localStorage.getItem("adminToken");
    await axios.delete(`/api/admin/users/${u.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  } catch (e) {
    console.error("Delete failed", e);
    alert("Failed to delete user");
  }
}

onMounted(fetchUsers);
</script>

<style scoped>
/* Layout */
.admin-page {
  display: flex;
  gap: 0;
}

.main-content {
  flex: 1;
  padding: 24px;
}

/* Page Header */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-head h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #111827;
}

.page-tools .search {
  display: flex;
  gap: 8px;
}

.page-tools input {
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 250px;
  transition: border-color 0.15s;
}

.page-tools input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.page-tools button {
  padding: 8px 16px;
  background: #3b82f6;
  color: #fff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.15s;
}

.page-tools button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* Card */
.content.card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  overflow: visible;
}

/* Table */
.grid.data-table {
  overflow-x: auto;
  overflow-y: visible;
  min-height: 200px;
}

.grid table {
  width: 100%;
  border-collapse: collapse;
  position: relative;
}

.grid tbody tr {
  position: relative;
}

.grid tbody tr:hover {
  background: #f9fafb;
}

.grid th,
.grid td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
  text-align: left;
  position: relative;
}

.grid th:last-child,
.grid td:last-child {
  position: relative;
  overflow: visible;
}

.grid thead th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.empty {
  color: #6b7280;
  text-align: center;
  padding: 2rem;
  font-style: italic;
}

/* Sort Button */
.linklike {
  background: none;
  border: none;
  padding: 0;
  color: #3b82f6;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.15s;
}

.linklike:hover {
  color: #2563eb;
  text-decoration: underline;
}

.linklike small {
  font-weight: 500;
  color: #6b7280;
}

/* Email Cell */
.email {
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.meta {
  color: #6b7280;
  font-size: 0.85rem;
}

/* Badges */
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

.badge.active {
  background: #d1fae5;
  color: #065f46;
  border-color: #6ee7b7;
}

.badge.inactive {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.badge.ok {
  background: #d1fae5;
  color: #065f46;
  border-color: #6ee7b7;
}

.badge.warn {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.badge.muted {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
}

.btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
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

/* Action Menu */
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
  min-width: 180px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.action-menu .menu a {
  padding: 8px 12px;
  text-decoration: none;
  color: #374151;
  border-radius: 6px;
  transition: all 0.15s;
  font-size: 0.9rem;
  font-weight: 500;
  display: block;
}

.action-menu .menu a:hover {
  background: #f3f4f6;
  color: #111827;
}

.action-menu .menu a.danger {
  color: #dc2626;
}

.action-menu .menu a.danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.pagination > div:first-child {
  color: #6b7280;
  font-size: 0.9rem;
}

.pagination .buttons {
  display: flex;
  gap: 8px;
}

.pagination .btn {
  padding: 8px 16px;
}

.pagination .btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
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

.modal-footer .btn {
  padding: 10px 20px;
}
</style>
