<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppTabBar from '@/components/AppTabBar.vue'

const route = useRoute()

const headerTitle = computed(() => {
  switch (route.path) {
    case '/':
      return undefined
    case '/appointment':
      return '预约挂号'
    case '/records':
      return '我的预约'
    default:
      return undefined
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader :title="headerTitle" />
    <main class="flex-1">
      <router-view />
    </main>
    <AppTabBar />
  </div>
</template>