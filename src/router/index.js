// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// User-facing pages
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

// Lazy user views
const QuizEdit = () => import("@/pages/QuizEdit.vue");
const BehavioralSettings = () => import("@/components/profile/Behavioral.vue");
const RoommateProfile = () => import("@/pages/RoommateProfile.vue");

// Admin SPA (lazy-load all)
const AdminLogin = () => import("@/pages/admin/AdminLogin.vue");
const AdminRegister = () => import("@/pages/admin/AdminRegister.vue");
const AdminDashboard = () => import("@/pages/admin/AdminDashboard.vue");
const AdminReports = () => import("@/pages/admin/Reports.vue");
const AdminUsersList = () => import("@/pages/admin/AdminUsersList.vue");
const AdminUserDetails = () => import("@/pages/admin/AdminUserDetails.vue");
const AdminUserForm = () => import("@/pages/admin/AdminUserForm.vue");
const AdminManagement = () => import("@/pages/admin/AdminManagement.vue"); // ⭐ NEW

// Route guards
function userGuard(to, from, next) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
}

function adminGuard(to, from, next) {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');

  if (!adminToken || !adminUser) {
    next('/admin/login');
    return;
  }

  try {
    const user = JSON.parse(adminUser);
    if (user.role !== 'ADMIN') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      next('/admin/login');
      return;
    }
  } catch (e) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    next('/admin/login');
    return;
  }

  next();
}

const routes = [
  // ===== User app =====
  { path: "/", name: "home", component: Home, alias: ["/home"], meta: { public: true } },
  { path: "/login", name: "login", component: Login, meta: { public: true } },
  { path: "/register", name: "register", component: Register, meta: { public: true } },

  { path: "/dashboard", name: "dashboard", component: Dashboard, beforeEnter: userGuard },
  { path: "/matches", name: "matches", component: Matches, beforeEnter: userGuard },

  {
    path: "/matches/view/:id",
    name: "match-card",
    component: MatchCard,
    beforeEnter: userGuard,
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

  { path: "/profile", name: "profile", component: Profile, beforeEnter: userGuard },
  { path: "/quiz", name: "quiz", component: Quiz, beforeEnter: userGuard },
  { path: "/quiz/edit", name: "quiz-edit", component: QuizEdit, beforeEnter: userGuard },
  { path: "/messages", name: "messages", component: Messages, beforeEnter: userGuard },
  { path: "/notifications", name: "notifications", component: Notifications, beforeEnter: userGuard },

  { path: "/suspended", name: "suspended", component: Suspended, meta: { public: true } },

  // Canonical public profile
  {
    path: "/roomfinder/:id(\\d+)",
    name: "roomfinder-public",
    component: RoommateProfile,
    props: true,
    meta: { public: true },
  },
  
  // Back-compat redirects
  {
    path: "/profile/:id(\\d+)",
    redirect: (to) => ({ name: "roomfinder-public", params: { id: to.params.id } }),
    meta: { public: true },
  },
  {
    path: "/u/:id(\\d+)",
    name: "public-profile",
    redirect: (to) => ({ name: "roomfinder-public", params: { id: to.params.id } }),
    meta: { public: true },
  },

  // ===== Admin SPA =====
  // Public admin routes
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin,
    meta: { public: true },
  },
  {
    path: '/admin/register',
    name: 'admin-register',
    component: AdminRegister,
    meta: { public: true },
  },

  // Protected admin routes
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: AdminReports,
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/users',
    name: 'AdminUsersList',
    component: AdminUsersList,
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/users/view/:id',
    name: 'AdminUserDetails',
    component: AdminUserDetails,
    beforeEnter: adminGuard,
    props: true,
  },
  {
    path: '/admin/users/new',
    name: 'AdminUserCreate',
    component: AdminUserForm,
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/users/edit/:id',
    name: 'AdminUserEdit',
    component: AdminUserForm,
    beforeEnter: adminGuard,
    props: true,
  },
  // ⭐ NEW: Admin Management Route
  {
    path: '/admin/management',
    name: 'admin-management',
    component: AdminManagement,
    beforeEnter: adminGuard,
  },

  // Legacy Thymeleaf redirects
  { path: "/admins", redirect: { name: "admin-dashboard" }, meta: { public: true } },
  { path: "/admin/messages", redirect: { name: "admin-dashboard" }, meta: { public: true } },
  { path: "/admin/analytics", redirect: { name: "admin-dashboard" }, meta: { public: true } },
  { path: "/admin/settings", redirect: { name: "admin-dashboard" }, meta: { public: true } },

  // 404 catch-all
  { path: "/:pathMatch(.*)*", redirect: { name: "home" }, meta: { public: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Global navigation guard (keep for backwards compatibility)
router.beforeEach((to) => {
  // Skip if using route-level guards
  if (to.beforeEnter) return true;
  
  //  SKIP ADMIN ROUTES - let adminGuard handle them
  if (to.path.startsWith('/admin')) return true;
  
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  const isPublic = to.meta?.public === true;

  if (!isPublic && !token) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});

export default router;