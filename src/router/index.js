import { createRouter, createWebHistory } from "vue-router";

import Home from "@/pages/Home.vue";
import Login from "@/pages/Login.vue";
import Register from "@/pages/Register.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Matches from "@/pages/Matches.vue";
import Profile from "@/pages/Profile.vue";
import Messages from "@/pages/Messages.vue";
import Quiz from "@/pages/Quiz.vue";
import Suspended from "@/pages/Suspended.vue";
import MatchCard from "@/components/MatchCard.vue";
import Notifications from "@/pages/Notifications.vue";

// Lazy views
const QuizEdit = () => import("@/pages/QuizEdit.vue");
const BehavioralSettings = () => import("@/components/profile/Behavioral.vue");
// Public profile (lazy – remove the static import you had)
const RoommateProfile = () => import("@/pages/RoommateProfile.vue");

const routes = [
  { path: "/", name: "home", component: Home, alias: ["/home"], meta: { public: true } },
  { path: "/login", name: "login", component: Login, meta: { public: true } },
  { path: "/register", name: "register", component: Register, meta: { public: true } },

  { path: "/dashboard", name: "dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/matches", name: "matches", component: Matches, meta: { requiresAuth: true } },

  {
    path: "/matches/view/:id",
    name: "match-card",
    component: MatchCard,
    meta: { requiresAuth: true },
    props: (route) => {
      let match = null;
      try {
        const raw = route.query.data;
        if (raw) match = JSON.parse(decodeURIComponent(raw));
      } catch {}
      if (!match) {
        match = {
          userId: Number(route.params.id),
          name: "User",
          age: null,
          gender: "",
          location: "",
          compatibility: 0,
          relationStatus: "NONE",
        };
      }
      return { match };
    },
  },

  { path: "/profile", name: "profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/quiz", name: "quiz", component: Quiz, meta: { requiresAuth: true } },
  { path: "/messages", name: "messages", component: Messages, meta: { requiresAuth: true } },
  { path: "/suspended", name: "suspended", component: Suspended, meta: { public: true } },
  // Canonical public profile
  {
    path: "/roomfinder/:id(\\d+)",
    name: "roomfinder-public",
    component: RoommateProfile,
    props: true,
    meta: { public: true },
  },

  // Settings
  {
    path: "/settings/quiz",
    name: "quiz-edit",
    component: QuizEdit,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings/behavioral",
    name: "behavioral-settings",
    component: BehavioralSettings,
    meta: { requiresAuth: true },
  },

  {
    path: "/settings/preferences",
    name: "prefs",
    component: () => import("@/pages/Preferences.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings/compatibility",
    name: "compat-analysis",
    component: () => import("@/pages/CompatibilityAnalysis.vue"),
    meta: { requiresAuth: true },
  },

  // Legacy path redirect (/profile/:id -> roomfinder-public)
  {
    path: "/profile/:id(\\d+)",
    redirect: (to) => ({ name: "roomfinder-public", params: { id: to.params.id } }),
    meta: { public: true },
  },

  // Legacy **named** route so { name: 'public-profile', params:{id} } keeps working
  {
    path: "/u/:id(\\d+)",
    name: "public-profile",
    redirect: (to) => ({ name: "roomfinder-public", params: { id: to.params.id } }),
    meta: { public: true },
  },

  // Optional: simple 404
  { path: "/:pathMatch(.*)*", redirect: { name: "home" }, meta: { public: true } },

  { path: '/notifications', name: 'notifications', component: () => import('@/pages/Notifications.vue') },
];

const router = createRouter({
  history: createWebHistory(), // or createWebHistory(import.meta.env.BASE_URL)
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Global auth guard
router.beforeEach((to) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token") || null;

  const isPublic = to.meta?.public === true;
  const needsAuth = to.meta?.requiresAuth === true;

  if (!isPublic && needsAuth && !token) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});

export default router;
