<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as VKID from '@vkid/sdk'

const VK_APP_ID = Number(import.meta.env.VITE_VK_APP_ID)
const REDIRECT_URI =
  import.meta.env.VITE_VK_REDIRECT_URI || `${window.location.origin}/vkid/callback`
const SCOPE = 'email phone'

const container = ref<HTMLElement | null>(null)
const isLoading = ref(true)

const handleVkLogin = () => {
  console.log('Fallback VK login clicked')
  // Здесь можно добавить прямую ссылку на VK OAuth
  window.location.href = `https://oauth.vk.com/authorize?client_id=${VK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPE}&response_type=code&v=5.131`
}

// PKCE helper
function base64url(str: Uint8Array) {
  return btoa(String.fromCharCode(...str))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function generateVerifier(len = 64) {
  const random = new Uint8Array(len)
  crypto.getRandomValues(random)
  const verifier = base64url(random)
  sessionStorage.setItem('vk_code_verifier', verifier)
  return verifier
}

onMounted(async () => {
  console.log('🔍 AuthView mounted')
  console.log('VK_APP_ID:', VK_APP_ID)
  console.log('REDIRECT_URI:', REDIRECT_URI)

  // Проверяем, что VK_APP_ID не NaN
  if (!VK_APP_ID || isNaN(VK_APP_ID)) {
    console.error('❌ VK_APP_ID не настроен или неверный:', VK_APP_ID)
    isLoading.value = false
    return
  }

  try {
    const codeVerifier = await generateVerifier()
    const state = crypto.randomUUID()
    sessionStorage.setItem('vk_oauth_state', state)

    console.log('✅ Инициализируем VK ID...')

    VKID.Config.init({
      app: VK_APP_ID,
      redirectUrl: REDIRECT_URI,
      state,
      codeVerifier, // SDK сгенерирует code_challenge автоматически
      scope: SCOPE,
      mode: VKID.ConfigAuthMode.Redirect, // редирект вместо popup
    })

    console.log('✅ VK ID Config инициализирован')

    // Ждем следующего тика, чтобы DOM обновился
    await nextTick()

    console.log('Container после nextTick:', container.value)

    if (container.value) {
      console.log('✅ Контейнер найден, рендерим OneTap...')
      const oneTap = new VKID.OneTap()
      oneTap
        .render({
          container: container.value,
          scheme: VKID.Scheme.LIGHT,
          lang: VKID.Languages.RUS,
        })
        .on(VKID.WidgetEvents.ERROR, (error: any) => {
          console.error('❌ VK ID Error:', error)
        })
      console.log('✅ OneTap рендеринг завершен')
    } else {
      console.error('❌ Контейнер не найден!')
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации VK ID:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#0077ff" />
              <path d="M12 16h24v2H12v-2zm0 6h24v2H12v-2zm0 6h16v2H12v-2z" fill="white" />
            </svg>
          </div>
          <h1 class="title">Добро пожаловать в Watcher</h1>
          <p class="subtitle">Войдите в систему для доступа к функциям приложения</p>
        </div>

        <div class="auth-content">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка...</p>
          </div>

          <div class="auth-options">
            <div class="auth-section">
              <h3>Быстрый вход</h3>
              <p>Используйте VK ID для быстрой авторизации</p>

              <div ref="container" class="vk-auth-container">
                <!-- Fallback кнопка, если VK ID не загрузится -->
                <div v-if="!isLoading && !container" class="fallback-button">
                  <button @click="handleVkLogin" class="vk-login-btn">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect width="20" height="20" rx="4" fill="#0077FF" />
                      <path d="M5 7h10v1H5V7zm0 2.5h10v1H5V9.5zm0 2.5h6v1H5V12z" fill="white" />
                    </svg>
                    Войти через VK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="auth-footer">
          <p class="terms">
            Нажимая кнопку входа, вы принимаете
            <a href="#" class="link">Условия использования</a> и
            <a href="#" class="link">Политику конфиденциальности</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: fit-content;
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 3rem 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  margin-bottom: 1.5rem;
}

.title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-break: keep-all;
  white-space: nowrap;
}

.subtitle {
  color: #666;
  font-size: clamp(0.875rem, 2.5vw, 1.125rem);
  margin: 0;
  line-height: 1.5;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  word-break: keep-all;
  hyphens: auto;
}

.auth-content {
  margin-bottom: 2rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
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

.auth-options {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.auth-section {
  text-align: center;
}

.auth-section h3 {
  font-size: clamp(1.125rem, 3vw, 1.375rem);
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.auth-section p {
  color: #666;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  word-break: keep-all;
  hyphens: auto;
}

.vk-auth-container {
  display: flex;
  justify-content: center;
  min-height: 60px;
}

.fallback-button {
  display: flex;
  justify-content: center;
  width: 100%;
}

.vk-login-btn {
  background: #0077ff;
  color: white;
  border: none;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
  border-radius: 12px;
  font-size: clamp(0.875rem, 2.5vw, 1.125rem);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  min-height: 48px;
  box-shadow: 0 2px 8px rgba(0, 119, 255, 0.3);
}

.vk-login-btn:hover {
  background: #0056b3;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.875rem;
}

.demo-btn {
  background: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #e0e0e0;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.auth-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.terms {
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #666;
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  word-break: keep-all;
  hyphens: auto;
}

.link {
  color: #0077ff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Десктоп - контролируем переносы */
@media (min-width: 769px) {
  .title {
    white-space: nowrap;
  }

  .subtitle,
  .auth-section p,
  .terms {
    word-break: keep-all;
    hyphens: auto;
  }
}

@media (max-width: 768px) {
  .auth-page {
    padding: 1rem;
    min-height: 100vh;
  }

  .auth-card {
    padding: clamp(1.5rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem);
  }

  .auth-container {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 0.75rem;
  }

  .auth-card {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }

  .logo {
    margin-bottom: 1rem;
  }

  .auth-header {
    margin-bottom: 1.5rem;
  }

  .auth-content {
    margin-bottom: 1.5rem;
  }

  .auth-options {
    gap: 1.5rem;
  }
}
</style>
