<template>
  <div class="layout admin-bg">
    <AdminSidebar />

    <main class="admin-management">
      <div class="header-section">
        <div class="header-content">
          <h1>👥 Admin Management</h1>
          <p>View and manage administrator accounts</p>
        </div>
        <router-link to="/admin/register" class="add-admin-btn">
          + Add New Admin
        </router-link>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading administrators...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="fetchAdmins" class="retry-btn">Try Again</button>
      </div>

      <!-- Admin List -->
      <div v-else-if="filteredAdmins.length > 0" class="admin-list">
        <div class="list-header">
          <span class="col-name">Name</span>
          <span class="col-email">Email</span>
          <span class="col-phone">Phone</span>
          <span class="col-created">Joined</span>
          <span class="col-actions">Actions</span>
        </div>

        <div v-for="admin in filteredAdmins" :key="admin.id" class="admin-item">
          <div class="col-name">
            <div class="admin-avatar">
              {{ admin.name.charAt(0).toUpperCase() }}
            </div>
            <div class="admin-info">
              <div class="admin-name">{{ admin.name }}</div>
              <div class="admin-id">ID: {{ admin.id }}</div>
            </div>
          </div>
          <div class="col-email">{{ admin.email }}</div>
          <div class="col-phone">{{ admin.phone || "N/A" }}</div>
          <div class="col-created">
            {{ formatDate(admin.createdAt) }}
          </div>
          <div class="col-actions">
            <button
              @click="viewAdmin(admin)"
              class="action-btn view-btn"
              title="View Details"
            >
              👁️
            </button>
            <button
              v-if="!isCurrentAdmin(admin.id)"
              @click="confirmDelete(admin)"
              class="action-btn delete-btn"
              title="Delete Admin"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No administrators found</p>
        <router-link to="/admin/register" class="add-first-admin">
          Add First Admin
        </router-link>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click="closeDeleteModal"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>⚠️ Confirm Deletion</h3>
          </div>
          <div class="modal-body">
            <p>
              Are you sure you want to delete admin
              <strong>{{ adminToDelete?.name }}</strong
              >?
            </p>
            <p class="warning-text">This action cannot be undone.</p>
          </div>
          <div class="modal-actions">
            <button @click="closeDeleteModal" class="cancel-btn">Cancel</button>
            <button
              @click="deleteAdmin"
              class="confirm-delete-btn"
              :disabled="deleting"
            >
              {{ deleting ? "Deleting..." : "Delete Admin" }}
            </button>
          </div>
        </div>
      </div>

      <!-- View Admin Modal -->
      <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
        <div class="modal-content view-modal" @click.stop>
          <div class="modal-header">
            <h3>👤 Admin Details</h3>
            <button @click="closeViewModal" class="close-btn">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedAdmin?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedAdmin?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">{{
                selectedAdmin?.phone || "N/A"
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Admin ID:</span>
              <span class="detail-value">{{ selectedAdmin?.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Joined:</span>
              <span class="detail-value">{{
                formatDate(selectedAdmin?.createdAt)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/api";
import AdminSidebar from "@/pages/admin/AdminSidebar.vue";

const admins = ref([]);
const loading = ref(true);
const error = ref("");
const searchQuery = ref("");

const showDeleteModal = ref(false);
const adminToDelete = ref(null);
const deleting = ref(false);

const showViewModal = ref(false);
const selectedAdmin = ref(null);

const currentAdminId = ref(null);

// Get current admin ID from localStorage
onMounted(() => {
  const adminUser = localStorage.getItem("adminUser");
  if (adminUser) {
    try {
      currentAdminId.value = JSON.parse(adminUser).id;
    } catch (e) {
      console.error("Failed to parse admin user:", e);
    }
  }
  fetchAdmins();
});

// Fetch all admins
async function fetchAdmins() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.get("/admin/all");

    admins.value = data.admins || data || [];
  } catch (err) {
    console.error("Failed to fetch admins:", err);
    error.value = err.response?.data?.error || "Failed to load administrators";
  } finally {
    loading.value = false;
  }
}

// Filter admins based on search query
const filteredAdmins = computed(() => {
  if (!searchQuery.value) return admins.value;

  const query = searchQuery.value.toLowerCase();
  return admins.value.filter(
    (admin) =>
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query)
  );
});

// Check if admin is current logged-in admin
function isCurrentAdmin(adminId) {
  return adminId === currentAdminId.value;
}

// View admin details
function viewAdmin(admin) {
  selectedAdmin.value = admin;
  showViewModal.value = true;
}

function closeViewModal() {
  showViewModal.value = false;
  selectedAdmin.value = null;
}

// Delete admin functions
function confirmDelete(admin) {
  adminToDelete.value = admin;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  adminToDelete.value = null;
}

async function deleteAdmin() {
  if (!adminToDelete.value) return;

  deleting.value = true;

  try {
    await api.delete(`/admin/${adminToDelete.value.id}`);

    // Remove from list
    admins.value = admins.value.filter((a) => a.id !== adminToDelete.value.id);
    closeDeleteModal();
  } catch (err) {
    console.error("Failed to delete admin:", err);
    alert(err.response?.data?.error || "Failed to delete admin");
  } finally {
    deleting.value = false;
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
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

.admin-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  color: #0c4a23;
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 800;
}

.header-content p {
  color: #667085;
  margin: 0;
  font-size: 1rem;
}

.add-admin-btn {
  background: #1b9536;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.2s ease;
}

.add-admin-btn:hover {
  background: #0f7a33;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 149, 54, 0.3);
}

.search-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #1b9536;
  box-shadow: 0 0 0 3px rgba(27, 149, 54, 0.1);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #1b9536;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-btn,
.add-first-admin {
  margin-top: 1rem;
  background: #1b9536;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.retry-btn:hover,
.add-first-admin:hover {
  background: #0f7a33;
}

.admin-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header,
.admin-item {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1.2fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  align-items: center;
}

.list-header {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 700;
  color: #374151;
  font-size: 0.9rem;
}

.admin-item {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.admin-item:hover {
  background: #fafafa;
}

.col-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b9536, #0c4a23);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.admin-info {
  min-width: 0;
}

.admin-name {
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-id {
  font-size: 0.8rem;
  color: #9ca3af;
}

.col-email,
.col-phone {
  color: #4b5563;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-created {
  color: #6b7280;
  font-size: 0.9rem;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background: #e0f2fe;
}

.view-btn:hover {
  background: #bae6fd;
  transform: scale(1.05);
}

.delete-btn {
  background: #fee;
}

.delete-btn:hover {
  background: #fcc;
  transform: scale(1.05);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem;
  color: #4b5563;
}

.warning-text {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.9rem;
}

.modal-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-delete-btn {
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-delete-btn {
  background: #dc2626;
  color: white;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.confirm-delete-btn:disabled {
  background: #fca5a5;
  cursor: not-allowed;
}

/* View Modal Details */
.view-modal .modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  flex: 0 0 120px;
  font-weight: 700;
  color: #374151;
}

.detail-value {
  color: #4b5563;
}

/* Responsive */
@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .list-header,
  .admin-item {
    grid-template-columns: 1.5fr 1.5fr 1fr 1fr 0.8fr;
    gap: 0.75rem;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .admin-management {
    padding: 1rem;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .list-header {
    display: none;
  }

  .admin-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }

  .col-name {
    grid-column: 1;
  }

  .col-email,
  .col-phone,
  .col-created {
    font-size: 0.9rem;
    padding-left: 56px;
  }

  .col-actions {
    justify-content: flex-start;
    padding-left: 56px;
  }
}
</style>
