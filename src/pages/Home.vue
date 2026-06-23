<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Clock } from 'lucide-vue-next'
import DoctorCard from '@/components/DoctorCard.vue'
import { useAppointment } from '@/composables/useAppointment'
import { getDoctorsByDate, getTodayDateString, formatDateDisplay } from '@/data/mock'
import type { Doctor } from '@/types'

const router = useRouter()
const { getTotalRemainingSlots } = useAppointment()

const today = getTodayDateString()
const doctors = computed(() => getDoctorsByDate(today))

const totalRemaining = computed(() => getTotalRemainingSlots(doctors.value))

function handleBook(doctor: Doctor) {
  router.push({
    path: '/appointment',
    query: { doctorId: String(doctor.id), date: today },
  })
}
</script>

<template>
  <div class="flex-1 pb-24">
    <div class="max-w-md mx-auto px-4 py-6">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-1">今天值班</h2>
        <p class="text-sm text-gray-500">{{ formatDateDisplay(today) }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-primary-50 rounded-2xl p-4 border border-primary-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Users class="w-4 h-4 text-primary-600" />
            </div>
            <span class="text-sm font-medium text-gray-600">值班医生</span>
          </div>
          <p class="text-2xl font-bold text-primary-600">{{ doctors.length }} 位</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock class="w-4 h-4 text-amber-500" />
            </div>
            <span class="text-sm font-medium text-gray-600">剩余号源</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">{{ totalRemaining }} 个</p>
        </div>
      </div>

      <div class="space-y-4">
        <DoctorCard
          v-for="doctor in doctors"
          :key="doctor.id"
          :doctor="doctor"
          :show-book-button="true"
          @book="handleBook"
        />
      </div>

      <div v-if="doctors.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500">今日暂无值班医生</p>
      </div>
    </div>
  </div>
</template>
