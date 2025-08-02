<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'

const router = useRouter()
const { user } = useUser()

const handleLogout = () => {
  // Очищаем данные пользователя
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')

  // Перенаправляем на страницу авторизации
  router.push('/auth')
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <h1>Watcher</h1>
      </div>
      <nav class="nav">
        <router-link to="/dashboard" class="nav-link">Панель управления</router-link>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover:not(.router-link-active) {
  color: #0077ff;
}

.nav-link.router-link-active {
  color: #0077ff;
  cursor: default;
  pointer-events: none;
  opacity: 0.7;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .nav {
    gap: 1rem;
  }

  .logout-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
