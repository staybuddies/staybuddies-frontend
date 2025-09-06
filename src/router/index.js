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
import RoommateProfile from "@/pages/RoommateProfile.vue";
import MatchCard from "@/components/MatchCard.vue";
import PublicProfile from "@/pages/PublicProfile.vue";

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
      // Fallback minimal object so component won’t crash if opened without data
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

  {
    path: "/roomfinder/:id(\\d+)",
    name: "roomfinder-public",
    component: RoommateProfile,
    props: true,
    meta: { public: true },
  },

  // Redirect legacy /profile/:id to the new public route
  {
    path: "/profile/:id",
    redirect: (to) => ({ name: "roomfinder-public", params: { id: to.params.id } }),
  },
  {
    path: "/profile/:id",
    name: "public-profile",
    component: PublicProfile,
    props: true,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
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
