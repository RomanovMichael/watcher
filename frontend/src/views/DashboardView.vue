<script setup lang="ts">
import { useUser } from '../composables/useUser'
import { useRouter } from 'vue-router'

const { user, isLoading, isError } = useUser()
const router = useRouter()
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Панель управления</h1>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка данных...</p>
      </div>

      <div v-else-if="isError" class="error">
        <h2>Ошибка загрузки</h2>
        <p>Не удалось загрузить данные пользователя</p>
        <button @click="router.push('/auth')" class="btn">Вернуться к авторизации</button>
      </div>

      <div v-else-if="user" class="dashboard-content">
        <div class="welcome-card">
          <div class="user-info">
            <div class="avatar">
              <img
                v-if="user.photo_100"
                :src="user.photo_100"
                :alt="user.first_name"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ user.first_name?.[0] || 'U' }}
              </div>
            </div>
            <div class="user-details">
              <h2>Добро пожаловать, {{ user.first_name }}!</h2>
              <p class="user-email">{{ user.email || 'Email не указан' }}</p>
            </div>
          </div>
        </div>

        <div class="dashboard-stats">
          <div class="stat-card">
            <h3>Статистика</h3>
            <p>Здесь будет статистика вашей активности</p>
          </div>

          <div class="stat-card">
            <h3>Настройки</h3>
            <p>Управление настройками аккаунта</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0077ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #dc3545;
}

.btn {
  background: #0077ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn:hover {
  background: #0056b3;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.welcome-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #0077ff;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.user-email {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-card p {
  margin: 0;
  color: #666;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .dashboard-stats {
    grid-template-columns: 1fr;
  }
}
</style>
