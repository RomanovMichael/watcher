<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const code = route.query.code as string | undefined
    const device_id = route.query.device_id as string | undefined
    const state = route.query.state as string | undefined

    if (!code || !device_id) {
      error.value = 'Отсутствуют обязательные параметры'
      return
    }

    // Проверяем state для защиты от CSRF
    const storedState = sessionStorage.getItem('vk_oauth_state')
    if (state !== storedState) {
      error.value = 'Ошибка безопасности: неверный state'
      return
    }

    const codeVerifier = sessionStorage.getItem('vk_code_verifier')
    if (!codeVerifier) {
      error.value = 'Отсутствует code_verifier'
      return
    }

    // Отправляем данные на бэкенд для обмена на токены
    // const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`/api/auth/vkid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        device_id,
        codeVerifier,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Сохраняем токены
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Очищаем временные данные
    sessionStorage.removeItem('vk_oauth_state')
    sessionStorage.removeItem('vk_code_verifier')

    // Перенаправляем на главную страницу
    router.replace('/')
  } catch (err) {
    console.error('Ошибка авторизации:', err)
    error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="callback-container">
    <div v-if="loading" class="loading">
      <h2>Авторизация...</h2>
      <p>Пожалуйста, подождите</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>Ошибка авторизации</h2>
      <p>{{ error }}</p>
      <button @click="router.push('/')" class="btn">Вернуться на главную</button>
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.loading,
.error {
  text-align: center;
  max-width: 400px;
}

.error {
  color: #dc3545;
}

.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn:hover {
  background: #0056b3;
}
</style>

<!--
📌 Callback‑роут (пример: /src/pages/VkIdCallback.vue)

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const code = route.query.code as string | undefined
  const device_id = route.query.device_id as string | undefined
  const state = route.query.state as string | undefined
  if (!code || !device_id) return router.replace('/')

  const storedState = sessionStorage.getItem('vk_oauth_state')
  if (state !== storedState) {
    console.error('State mismatch – возможен CSRF')
    return router.replace('/login')
  }

  const codeVerifier = sessionStorage.getItem('vk_code_verifier')
  // Отправляем данные на собственный API для обмена на access/refresh‑token
  await fetch('/api/auth/vkid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, device_id, codeVerifier }),
  })
  router.replace('/dashboard')
})
</script>
-->
