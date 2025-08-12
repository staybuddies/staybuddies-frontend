import { createRouter, createWebHistory } from "vue-router";

import Home from "@/pages/Home.vue";
import Login from "@/pages/Login.vue";
import Register from "@/pages/Register.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Matches from "@/pages/Matches.vue";
import Profile from "@/pages/Profile.vue";
import Messages from "@/pages/Messages.vue";
import Quiz from "@/pages/Quiz.vue";

const routes = [
  { path: "/", name: "home", component: Home, alias: ["/home"] },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/dashboard", component: Dashboard },
  { path: "/matches", component: Matches },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/quiz", component: Quiz, meta: { requiresAuth: true } },
  { path: "/messages", component: Messages, meta: { requiresAuth: true } },
{ path: '/profile/:id', component: () => import('@/pages/PublicProfile.vue') }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global auth guard (Vue Router v4: returning a path is valid)
router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const publicPages = ["/login", "/register", "/"];
  if (to.meta.requiresAuth && !token) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
  // if ((to.path === "/login" || to.path === "/register") && token) {
  //   return "/dashboard";
  // }
});

export default router;
