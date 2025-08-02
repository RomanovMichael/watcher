<script setup lang="ts">
import { useUser } from '../composables/useUser'
import { useRouter } from 'vue-router'

const { user, isLoading } = useUser()
const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<template>
  <main>
    <div class="container">
      <h1>Добро пожаловать в Watcher!</h1>
      <p>Это главная страница приложения для авторизованных пользователей.</p>
      <button @click="goToDashboard" class="dashboard-btn">Перейти в панель управления</button>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #1a1a1a;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 700;
}

p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.dashboard-btn {
  background: #0077ff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dashboard-btn:hover {
  background: #0056b3;
}
</style>
