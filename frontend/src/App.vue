<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <!-- Хедер показывается везде, кроме страницы авторизации -->
    <AppHeader v-if="route.name !== 'auth'" />

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>  
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .nav {
    gap: 1rem;
  }
}
</style>
