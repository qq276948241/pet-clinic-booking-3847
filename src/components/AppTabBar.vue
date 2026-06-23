<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, CalendarDays, FileText } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

interface TabItem {
  path: string
  label: string
  icon: any
}

const tabs: TabItem[] = [
  { path: '/', label: '首页', icon: Home },
  { path: '/appointment', label: '预约', icon: CalendarDays },
  { path: '/records', label: '记录', icon: FileText },
]

const isActive = (path: string) => route.path === path

function navigate(path: string) {
  if (route.path !== path) {
    router.push(path)
  }
}

const activeIndex = computed(() => tabs.findIndex((t) => t.path === route.path))
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-primary-100 shadow-soft"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="max-w-md mx-auto flex items-center justify-around h-16 relative">
      <div
        class="absolute bottom-2 w-1/3 h-12 transition-all duration-300 ease-out"
        :style="{ left: `calc(${activeIndex * 100}% / 3)`, padding: '0 8px' }"
      >
        <div class="w-full h-full bg-primary-100 rounded-xl"></div>
      </div>
      <button
        v-for="tab in tabs"
        :key="tab.path"
        class="relative z-10 flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all duration-200"
        @click="navigate(tab.path)"
      >
        <component
          :is="tab.icon"
          class="w-5 h-5 transition-colors duration-200"
          :class="isActive(tab.path) ? 'text-primary-600' : 'text-gray-400'"
        />
        <span
          class="text-xs font-medium transition-colors duration-200"
          :class="isActive(tab.path) ? 'text-primary-600' : 'text-gray-400'"
        >
          {{ tab.label }}
        </span>
      </button>
    </div>
  </nav>
</template>
