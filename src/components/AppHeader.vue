<script setup lang="ts">
import { computed } from 'vue'
import { Stethoscope, Calendar } from 'lucide-vue-next'
import { formatDateDisplay, getTodayDateString } from '@/data/mock'

const title = defineProps<{ title?: string }>()

const todayDisplay = computed(() => formatDateDisplay(getTodayDateString()))
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-primary-100 shadow-soft">
    <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
          <Stethoscope class="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-800">
            {{ title || '萌宠宠物医院' }}
          </h1>
        </div>
      </div>
      <div class="flex items-center gap-1 text-sm text-gray-500">
        <Calendar class="w-4 h-4 text-primary-500" />
        <span>{{ todayDisplay }}</span>
      </div>
    </div>
  </header>
</template>
