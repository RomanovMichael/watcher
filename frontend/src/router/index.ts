import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VkIdCallback from '../components/VkIdCallback.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/vkid/callback',
      name: 'vk-callback',
      component: VkIdCallback,
    },
  ],
})

export default router
