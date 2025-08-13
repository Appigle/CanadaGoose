import { navigationMonitor } from '@/services/navigationMonitor'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, redirectIfAuthenticated: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignupView.vue'),
      meta: { requiresAuth: false, redirectIfAuthenticated: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { requiresAuth: false },
    },
    // Catch-all route for 404 errors
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

// Route guards for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token')

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Log authentication redirect
    navigationMonitor.logManualNavigation(from.path, '/login', {
      reason: 'authentication_required',
      intendedRoute: to.path,
      type: 'auth_redirect',
    })

    // Redirect to login if not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route should redirect authenticated users
  if (to.meta.redirectIfAuthenticated && isAuthenticated) {
    // Log authenticated user redirect
    navigationMonitor.logManualNavigation(from.path, '/dashboard', {
      reason: 'already_authenticated',
      intendedRoute: to.path,
      type: 'auth_redirect',
    })

    // Redirect to dashboard if already authenticated
    next({ name: 'dashboard' })
    return
  }

  // Continue navigation
  next()
})

// After each route change, log the navigation
router.afterEach((to, from) => {
  // Log successful navigation
  navigationMonitor.logManualNavigation(from.path, to.path, {
    routeName: to.name,
    routeMeta: to.meta,
    type: 'route_complete',
  })
})

export default router
