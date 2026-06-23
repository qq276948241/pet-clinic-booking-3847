<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, User } from 'lucide-vue-next'
import type { Doctor } from '@/types'

const props = defineProps<{
  doctor: Doctor
  showBookButton?: boolean
}>()

const emit = defineEmits<{
  book: [doctor: Doctor]
}>()

const router = useRouter()

const remainingSlots = computed(() => props.doctor.totalSlots - props.doctor.bookedSlots)

const slotStatus = computed(() => {
  if (remainingSlots.value === 0) return { color: 'text-red-500', bg: 'bg-red-50', label: '已满' }
  if (remainingSlots.value <= 3) return { color: 'text-amber-600', bg: 'bg-amber-50', label: '紧张' }
  return { color: 'text-primary-600', bg: 'bg-primary-50', label: '充足' }
})

function handleBook() {
  emit('book', props.doctor)
}
</script>

<template>
  <div class="bg-white rounded-2xl p-4 shadow-card border border-primary-50 hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-start gap-4">
      <div class="relative flex-shrink-0">
        <img
          :src="doctor.avatar"
          :alt="doctor.name"
          class="w-16 h-16 rounded-full object-cover border-2 border-primary-200"
          loading="lazy"
        />
        <div
          class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
          :class="[slotStatus.bg, slotStatus.color]"
        >
          {{ remainingSlots }}
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-base font-bold text-gray-800">{{ doctor.name }}</h3>
          <span class="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
            {{ doctor.title }}
          </span>
        </div>
        <div class="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <User class="w-3.5 h-3.5 text-primary-500" />
          <span>{{ doctor.department }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 text-xs">
            <Clock class="w-3 h-3 text-gray-400" />
            <span :class="slotStatus.color">
              剩余 {{ remainingSlots }} 个号
            </span>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="[slotStatus.bg, slotStatus.color]"
          >
            号源{{ slotStatus.label }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="showBookButton" class="mt-4">
      <button
        class="w-full py-2.5 rounded-full font-medium text-white transition-all duration-200"
        :class="
          remainingSlots === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-primary-500 hover:bg-primary-600 active:scale-98'
        "
        :disabled="remainingSlots === 0"
        @click="handleBook"
      >
        {{ remainingSlots === 0 ? '今日已满' : '立即预约' }}
      </button>
    </div>
  </div>
</template>
