import { createRouter, createWebHistory } from 'vue-router'
import { checkAuth } from '@/middleware/auth'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = checkAuth();
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router
