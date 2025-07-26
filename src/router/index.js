import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue';
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue';
import Dashboard from '../pages/Dashboard.vue'
import Matches from '../pages/Matches.vue'
import Profile from '../pages/Profile.vue'
import Messages from '../pages/Messages.vue'

//by ZNW
// import Login from '@/views/Login.vue';
// import Register from '@/views/Register.vue';
// import Profile from '@/views/Profile.vue';
// import Quiz from '@/views/Quiz.vue';
// import Messages from '@/views/Messages.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard},
  { path: '/matches', component: Matches},
  { 
    path: '/profile', 
    component: Profile,
    meta: { requiresAuth: true }
  },
  // {
  //    path: '/quiz', 
  //    component: Quiz,
  //    meta: { requiresAuth: true } 
  // },
  { 
    path: '/messages', 
    component: Messages,
     meta: { requiresAuth: true }
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

//for JSON web token authentication
router.beforeEach((to, from, next) => {
  const jwt = localStorage.getItem('jwt');
  if (to.meta.requiresAuth && !jwt) {
    return next('/login');
  }
  next();
});

export default router