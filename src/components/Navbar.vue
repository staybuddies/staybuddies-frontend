<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="left">
        <img src="../assets/logo.png" alt="StayBuddies" class="logo" />
        <span class="brand">StayBuddies</span>
      </div>

      <ul class="nav-links">
        <li>
          <router-link
            to="/dashboard"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/dashboard' }"
            >Dashboard</router-link
          >
        </li>
        <li>
          <router-link
            to="/matches"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/matches' }"
            >Matches</router-link
          >
        </li>
        <li>
          <router-link
            to="/messages"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/messages' }"
            >Messages</router-link
          >
        </li>
        <li>
          <router-link
            to="/profile"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/profile' }"
            >Profile</router-link
          >
        </li>
      </ul>

      <div class="right-icons">
        <!-- Bigger bell with badge -->
        <button class="bell" @click="openMessages" aria-label="Notifications">
          <span class="nav-icon">🔔</span>
          <span v-if="unreadCount" class="badge">{{ badgeText }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import { connect, subscribeJson } from "@/ws/stomp";

const router = useRouter();

const unreadCount = ref(0);
const activeThreadId = ref(null); // learned from Messages.vue
const badgeText = computed(() =>
  unreadCount.value > 9 ? "9+" : String(unreadCount.value)
);

let unsubscribeNotice = null;

// 1) get the true unread total from backend
async function fetchUnread() {
  try {
    const { data } = await api.get("/messages/threads");
    const list = Array.isArray(data) ? data : [];
    unreadCount.value = list.reduce((sum, c) => sum + Number(c.unread || 0), 0);
  } catch {
    unreadCount.value = 0;
  }
}

// 2) live notices (only increment if it's NOT the thread you're currently viewing)
async function startNoticeListener() {
  await connect();
  unsubscribeNotice = await subscribeJson(
    "/user/queue/notifications",
    (notice) => {
      if (!notice) return;
      if (notice.type === "NEW_MESSAGE") {
        const tid = Number(notice.threadId);
        if (activeThreadId.value && Number(activeThreadId.value) === tid) {
          // user is viewing this thread; Messages.vue will mark it read and cause a refresh
          return;
        }
        unreadCount.value = Math.min(99, unreadCount.value + 1);
      }
    }
  );
}

function openMessages() {
  // just navigate; do NOT forcibly clear the badge here
  router.push({ path: "/messages" });
}

// 3) listen for cross-component events
function onActiveThread(e) {
  activeThreadId.value = e?.detail ?? null;
}
function onUnreadRefresh() {
  fetchUnread();
}

onMounted(async () => {
  await fetchUnread();
  await startNoticeListener();

  window.addEventListener("sb-active-thread", onActiveThread);
  window.addEventListener("sb-unread-refresh", onUnreadRefresh);
});

onBeforeUnmount(() => {
  if (unsubscribeNotice) unsubscribeNotice();
  window.removeEventListener("sb-active-thread", onActiveThread);
  window.removeEventListener("sb-unread-refresh", onUnreadRefresh);
});
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #ddd;
  width: 100%;
}
.navbar-container {
  width: 100%;
  padding: 0.5rem 0.05rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
}
.logo {
  height: 40px;
  margin-right: 0.5rem;
}
.brand {
  color: #1b9536;
  font-weight: bold;
  font-size: 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-link {
  text-decoration: none;
  color: #1b9536;
  font-weight: 600;
  font-size: 1.3rem;
}
.nav-link:hover {
  text-decoration: underline;
}
:deep(.active-link) {
  color: #0b5e1f !important;
}

.right-icons {
  display: flex;
  gap: 1.5rem;
  color: #1b9536;
}

/* Bigger bell */
.bell {
  position: relative;
  background: transparent;
  border: 0;
  padding: 4px;
  cursor: pointer;
  line-height: 1;
}
.nav-icon {
  pointer-events: none;
  font-size: 26px; /* <- bigger */
}

/* Badge */
.badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #e03131;
  color: #fff;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px #fff; /* small border for contrast */
}
</style>
