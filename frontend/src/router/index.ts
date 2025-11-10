import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/books/:id',
    name: 'BookDetail',
    component: () => import('../views/BookDetail.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, hideForAuth: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false, hideForAuth: true },
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, requiresPustakawan: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/analytics'
      },
      {
        path: 'analytics',
        name: 'DashboardAnalytics',
        component: () => import('../views/dashboard/Analytics.vue'),
      },
      {
        path: 'books',
        name: 'DashboardBooks',
        component: () => import('../views/dashboard/Books.vue'),
      },
      {
        path: 'users',
        name: 'DashboardUsers',
        component: () => import('../views/dashboard/Users.vue'),
      },
      {
        path: 'settings',
        name: 'DashboardSettings',
        component: () => import('../views/dashboard/Settings.vue'),
      },
    ],
  },
  // 404 Page
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth store if not already done
  if (!authStore.user) {
    authStore.initUser();
  }

  // Redirect authenticated users away from login/register
  if (to.meta.hideForAuth && authStore.user) {
    next('/');
    return;
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.user) {
    next('/login');
    return;
  }

  // Check if route requires pustakawan role
  if (to.meta.requiresPustakawan && authStore.user?.role !== 'pustakawan') {
    next('/403');
    return;
  }

  next();
});

export default router;