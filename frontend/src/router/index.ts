import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import DashboardView from '../views/DashboardView.vue'
import VkIdCallback from '../components/VkIdCallback.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/auth',
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/vkid/callback',
      name: 'vk-callback',
      component: VkIdCallback,
    },
  ],
})

// Защита маршрутов
router.beforeEach((to, from, next) => {
  console.log('🔍 Router guard:', { to: to.name, from: from.name })

  const accessToken = localStorage.getItem('access_token')
  const isAuthenticated = !!accessToken

  console.log('🔐 Auth status:', { isAuthenticated, hasToken: !!accessToken })

  // Если маршрут требует авторизации
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      console.log('🚫 Redirecting to /auth (requires auth)')
      next('/auth')
      return
    }
  }

  // Если неавторизованный пользователь идет на главную страницу
  if (!isAuthenticated && to.name === 'home') {
    console.log('🚫 Redirecting to /auth (not authenticated on home)')
    next('/auth')
    return
  }

  // Если авторизованный пользователь идет на главную страницу
  if (isAuthenticated && to.name === 'home') {
    console.log('🚫 Redirecting to /dashboard (authenticated on home)')
    next('/dashboard')
    return
  }

  // Если авторизованный пользователь идет на страницу авторизации
  if (isAuthenticated && to.name === 'auth') {
    console.log('🚫 Redirecting to /dashboard (authenticated on auth)')
    next('/dashboard')
    return
  }

  console.log('✅ Allowing navigation to:', to.name)
  next()
})

export default router
