import { ref, computed } from 'vue'

interface User {
  id: number
  first_name: string
  last_name: string
  email?: string
  photo_100?: string
  photo_200?: string
}

interface UserResponse {
  user: User
  access_token: string
  refresh_token: string
}

const user = ref<User | null>(null)
const isLoading = ref(false)
const isError = ref(false)

// Проверяем, есть ли токен в localStorage
const hasToken = computed(() => {
  return !!localStorage.getItem('access_token')
})

// Проверяем, авторизован ли пользователь
const isAuthenticated = computed(() => {
  return !!user.value && hasToken.value
})

// Загружаем данные пользователя из localStorage
const loadUserFromStorage = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      user.value = JSON.parse(userData)
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя:', error)
      localStorage.removeItem('user')
    }
  }
}

// Запрашиваем данные пользователя с сервера
const fetchUser = async () => {
  if (!hasToken.value) {
    user.value = null
    return
  }

  isLoading.value = true
  isError.value = false

  try {
    const response = await fetch('/api/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Токен истек, очищаем данные
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        user.value = null
        return
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    user.value = data.user

    // Обновляем данные в localStorage
    localStorage.setItem('user', JSON.stringify(data.user))
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

// Инициализируем данные при создании композабла
loadUserFromStorage()

export function useUser() {
  return {
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    isError: computed(() => isError.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    hasToken: computed(() => hasToken.value),
    fetchUser,
    loadUserFromStorage,
  }
}
