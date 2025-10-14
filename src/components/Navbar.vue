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

      <!-- Hamburger menu button for mobile -->
      <button
        class="hamburger"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
        :class="{ active: mobileMenuOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
        <li>
          <router-link
            to="/dashboard"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/dashboard' }"
            @click="closeMobileMenu"
            >Dashboard</router-link
          >
        </li>
        <li>
          <router-link
            to="/matches"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/matches' }"
            @click="closeMobileMenu"
            >Potential Matches</router-link
          >
        </li>
        <li>
          <router-link
            to="/messages"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/messages' }"
            @click="closeMobileMenu"
            >Messages</router-link
          >
        </li>
        <li>
          <router-link
            to="/profile"
            exact
            class="nav-link"
            :class="{ 'active-link': $route.path === '/profile' }"
            @click="closeMobileMenu"
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
import { useNotices } from "@/composables/useNotices";

const router = useRouter();

// Mobile menu state
const mobileMenuOpen = ref(false);

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}

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
  closeMobileMenu();
}

async function init() {
  await fetchUnread();
  await startLive();
  startPushOnce();
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
  padding: 10px;
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

/* Hamburger menu button */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 25;
}

.hamburger span {
  display: block;
  width: 25px;
  height: 3px;
  background: #1b9536;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Responsive styles */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
    order: 2;
  }

  .right-icons {
    order: 3;
  }

  .nav-links {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background: #fff;
    border-bottom: 1px solid #e6e6e6;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .nav-links.mobile-open {
    max-height: 400px;
  }

  .nav-links li {
    width: 100%;
    border-bottom: 1px solid #f0f0f0;
  }

  .nav-links li:last-child {
    border-bottom: none;
  }

  .nav-link {
    display: block;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }

  .brand {
    font-size: 1.3rem;
  }

  .logo {
    height: 35px;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 8px 8px;
  }

  .brand {
    font-size: 1.1rem;
  }

  .logo {
    height: 30px;
    margin-right: 0.3rem;
  }

  .bell {
    padding: 8px;
  }

  .bell-svg {
    width: 24px;
    height: 24px;
  }

  .badge {
    min-width: 16px;
    height: 16px;
    font-size: 11px;
    line-height: 16px;
  }
}
</style>
