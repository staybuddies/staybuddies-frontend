<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="left">
        <router-link
          class="brand-link"
          :to="{ name: 'home' }"
          aria-label="Go to Home"
        >
          <img src="@/assets/logo.png" alt="StayBuddies" class="logo" />
          <span class="brand">StayBuddies</span>
        </router-link>
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
            >Potential Matches</router-link
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
        <!-- Unified notifications bell -->
        <button
          class="bell"
          @click="openNotifications"
          aria-label="Notifications"
        >
          <svg
            class="bell-svg"
            viewBox="0 0 24 24"
            width="28"
            height="28"
            aria-hidden="true"
            :class="{ ring: justIncremented }"
          >
            <path
              d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h20v-1l-2-2Z"
              fill="currentColor"
            />
          </svg>
          <span v-if="unreadBadge" class="badge">{{ unreadBadge }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { startPushOnce } from "@/push";
import { useNotices } from "@/composables/useNotices"; // from the previous step

const router = useRouter();

// Unified unread counter (messages + match notices)
const { unread, fetchUnread, startLive, stopLive } = useNotices();

const unreadBadge = computed(() =>
  !unread.value ? "" : unread.value > 9 ? "9+" : String(unread.value)
);

const justIncremented = ref(false);
function pulse() {
  justIncremented.value = false;
  requestAnimationFrame(() => (justIncremented.value = true));
  setTimeout(() => (justIncremented.value = false), 800);
}

function openNotifications() {
  router.push({ name: "notifications" });
}

async function init() {
  await fetchUnread();
  await startLive(); // WebSocket live stream for notices
  startPushOnce(); // register FCM token (no-op if already started)
  // Foreground push nudge → pulse the bell
  window.addEventListener("sb-notice-refresh", pulse);
}

onMounted(init);
onBeforeUnmount(() => {
  stopLive();
  window.removeEventListener("sb-notice-refresh", pulse);
});
</script>

<style scoped>
/* HEADER (navbar + auth on one line) */
.navbar {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 20;
}
.navbar-container {
  width: 100%;
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 56px;
}
.left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.logo {
  height: 40px;
  margin-right: 0.5rem;
  width: auto;
  display: block;
  object-fit: contain;
}
.brand {
  color: #1b9536;
  font-weight: 800;
  font-size: 1.6rem;
  white-space: nowrap;
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
  font-weight: 700;
  font-size: 1.15rem;
}
.nav-link:hover {
  text-decoration: underline;
}
:deep(.active-link) {
  color: #0b5e1f !important;
}

.right-icons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.bell {
  position: relative;
  background: #f4fff7;
  border: 1px solid #bfe7cc;
  color: #139a41;
  padding: 6px;
  border-radius: 12px;
  cursor: pointer;
  line-height: 1;
  transition: box-shadow 0.2s ease;
}
.bell:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.bell-svg {
  display: block;
}
.bell-svg.ring {
  animation: ring 0.8s ease;
}
@keyframes ring {
  0% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-12deg);
  }
  40% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(-8deg);
  }
  80% {
    transform: rotate(6deg);
  }
  100% {
    transform: rotate(0);
  }
}
.left .brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}
.left .brand-link:hover .brand {
  text-decoration: underline;
}

.logo,
.brand {
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #e03131;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px #fff;
}
</style>
