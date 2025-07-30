<script setup lang="ts">
/*
 * VK ID One‑Tap авторизация для Vue 3 (Composition API)
 * — создаёт виджет OneTap SDK в контейнере
 * — PKCE (code verifier + challenge) генерируется вручную и сохраняется в sessionStorage
 * — после логина VK перенаправит на REDIRECT_URI с query ?code=…&device_id=…&state=…
 *    На этой же странице/роуте отправляем код на бэкенд для обмена на токены.
 */
import { ref, onMounted } from 'vue'
import * as VKID from '@vkid/sdk'

const VK_APP_ID = Number(import.meta.env.VITE_VK_APP_ID)
const REDIRECT_URI =
  import.meta.env.VITE_VK_REDIRECT_URI || `${window.location.origin}/vkid/callback`
const SCOPE = 'email phone'

/**** PKCE helper ***/
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

/**** Инициализируем SDK ***/
const container = ref<HTMLElement | null>(null)
onMounted(async () => {
  const codeVerifier = await generateVerifier()
  const state = crypto.randomUUID()
  sessionStorage.setItem('vk_oauth_state', state)

  VKID.Config.init({
    app: VK_APP_ID,
    redirectUrl: REDIRECT_URI,
    state,
    codeVerifier, // SDK сгенерирует code_challenge автоматически
    scope: SCOPE,
    mode: VKID.ConfigAuthMode.Redirect, // редирект вместо popup
  })

  if (container.value) {
    const oneTap = new VKID.OneTap()
    oneTap
      .render({
        container: container.value,
        scheme: VKID.Scheme.LIGHT,
        lang: VKID.Languages.RUS,
      })
      .on(VKID.WidgetEvents.ERROR, console.error)
  }
})
</script>

<template>
  <!-- Контейнер для виджета VK ID OneTap -->
  <div ref="container" />
</template>

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
