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
        <button class="bell" @click="openMessages" aria-label="Notifications">
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
import { startPushOnce } from "@/push";

onMounted(async () => {
  await fetchUnread();
  await startNoticeListeners();
  // Start web push token registration (no-op if already started)
  startPushOnce();
  window.addEventListener("sb-active-thread", onActiveThread);
  window.addEventListener("sb-unread-refresh", onUnreadRefresh);
});

const router = useRouter();

const unreadCount = ref(0);
const badgeText = computed(() =>
  unreadCount.value > 9 ? "9+" : String(unreadCount.value)
);
const activeThreadId = ref(null);
const justIncremented = ref(false);

let unsubUserQueue = null;
let unsubFallback = null;
let myId = null;

function bumpBadge() {
  unreadCount.value = Math.min(99, unreadCount.value + 1);
  justIncremented.value = false;
  requestAnimationFrame(() => (justIncremented.value = true));
  setTimeout(() => (justIncremented.value = false), 800);
}

async function fetchUnread() {
  try {
    const { data } = await api.get("/messages/threads");
    const list = Array.isArray(data) ? data : [];
    unreadCount.value = list.reduce((sum, c) => sum + Number(c.unread || 0), 0);
  } catch {
    unreadCount.value = 0;
  }
}

async function startNoticeListeners() {
  await connect();

  // 1) per-user queue (only if a WebSocket Principal exists)
  unsubUserQueue = await subscribeJson("/user/queue/notice", (notice) => {
    if (!notice || notice.type !== "MESSAGE") return;
    const tid = Number(notice.threadId);
    if (activeThreadId.value && Number(activeThreadId.value) === tid) return;
    bumpBadge();
  });

  // 2) public fallback topic using *real* user id from backend
  if (!myId) {
    const { data } = await api.get("/me");
    myId = data?.id;
  }
  if (myId) {
    unsubFallback = await subscribeJson(
      `/topic/notice.user-${myId}`,
      (notice) => {
        if (!notice || notice.type !== "MESSAGE") return;
        const tid = Number(notice.threadId);
        if (activeThreadId.value && Number(activeThreadId.value) === tid)
          return;
        bumpBadge();
      }
    );
  }
}

function openMessages() {
  router.push({ path: "/messages" });
}

function onActiveThread(e) {
  activeThreadId.value = e?.detail ?? null;
}
function onUnreadRefresh() {
  fetchUnread();
}

onMounted(async () => {
  await fetchUnread();
  await startNoticeListeners();
  window.addEventListener("sb-active-thread", onActiveThread);
  window.addEventListener("sb-unread-refresh", onUnreadRefresh);
});
onBeforeUnmount(() => {
  if (unsubUserQueue) unsubUserQueue();
  if (unsubFallback) unsubFallback();
  window.removeEventListener("sb-active-thread", onActiveThread);
  window.removeEventListener("sb-unread-refresh", onUnreadRefresh);
});
</script>

<style scoped>
/* HEADER (navbar + auth on one line) */
.navbar {
  /* remove sticky if you want it truly identical; or leave if you like sticky */
  /* position: sticky; top: 0; z-index: 50; */
  background: #fff;
  border-bottom: 1px solid #e6e6e6; /* match NavBar.vue */
  width: 100%;
}

.navbar-container {
  width: 100%; /* match NavBar.vue */
  padding: 0.5rem 0.05rem; /* same vertical/horizontal padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px; /* same as NavBar.vue */
  margin-right: 0.5rem; /* to match brand spacing */
  width: auto;
  display: block;
  object-fit: contain;
}

.brand {
  color: #1b9536; /* same green */
  font-weight: 800; /* same weight */
  font-size: 2rem; /* same size as NavBar.vue */
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
  color: inherit; /* don’t change color when linked */
}
.left .brand-link:hover .brand {
  text-decoration: underline; /* small hover affordance */
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
