<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar, Clock, Phone, X, FileText, AlertCircle } from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import { getAppointments, updateAppointmentStatus, saveAppointments } from '@/utils/storage'
import { mockAppointments, formatDateDisplay } from '@/data/mock'
import { PetTypeLabels, PetTypeEmojis } from '@/types'
import type { Appointment } from '@/types'

const appointments = ref<Appointment[]>([])

const activeTab = ref<'all' | 'pending'>('all')

const filteredAppointments = computed(() => {
  if (activeTab.value === 'pending') {
    return appointments.value.filter((a) => a.status === 'pending')
  }
  return appointments.value
})

const pendingCount = computed(() =>
  appointments.value.filter((a) => a.status === 'pending').length
)

const showCancelConfirm = ref(false)
const cancelTargetId = ref<string | null>(null)

onMounted(() => {
  loadAppointments()
})

function loadAppointments() {
  const stored = getAppointments()
  if (stored.length === 0) {
    appointments.value = [...mockAppointments]
    saveAppointments(mockAppointments)
  } else {
    appointments.value = stored
  }
}

function confirmCancel(id: string) {
  cancelTargetId.value = id
  showCancelConfirm.value = true
}

function handleCancel() {
  if (cancelTargetId.value) {
    updateAppointmentStatus(cancelTargetId.value, 'cancelled')
    loadAppointments()
  }
  showCancelConfirm.value = false
  cancelTargetId.value = null
}

function maskPhone(phone: string): string {
  if (phone.length >= 11) {
    return phone.slice(0, 3) + '****' + phone.slice(-4)
  }
  return phone
}
</script>

<template>
  <div class="flex-1 pb-24">
    <div v-if="showCancelConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle class="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">确认取消</h3>
            <p class="text-sm text-gray-500">取消后将无法恢复，确定要取消这个预约吗？</p>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            @click="showCancelConfirm = false; cancelTargetId = null"
          >
            再想想
          </button>
          <button
            class="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
            @click="handleCancel"
          >
            确认取消
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto px-4 py-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">我的预约</h2>

      <div class="flex gap-2 mb-6">
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          :class="
            activeTab === 'all'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          "
          @click="activeTab = 'all'"
        >
          全部（{{ appointments.length }}）
        </button>
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          :class="
            activeTab === 'pending'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          "
          @click="activeTab = 'pending'"
        >
          待就诊（{{ pendingCount }}）
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="apt in filteredAppointments"
          :key="apt.id"
          class="bg-white rounded-2xl p-4 shadow-card border border-gray-50"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-800">{{ apt.doctorName }}</span>
                <StatusTag :status="apt.status" />
              </div>
              <div class="text-xs text-gray-400">{{ apt.id }}</div>
            </div>
            <div class="text-right">
              <span class="text-2xl">{{ PetTypeEmojis[apt.petType] }}</span>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-600 mb-4">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{{ formatDateDisplay(apt.date) }}</span>
              <span class="text-gray-300">|</span>
              <Clock class="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{{ apt.time }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
                {{ PetTypeLabels[apt.petType] }}
              </span>
              <span>{{ apt.petName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{{ maskPhone(apt.ownerPhone) }}</span>
            </div>
            <div v-if="apt.description" class="flex items-start gap-2">
              <FileText class="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
              <span class="text-gray-500">{{ apt.description }}</span>
            </div>
          </div>

          <div v-if="apt.status === 'pending'" class="flex gap-2">
            <button
              class="flex-1 py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
              @click="confirmCancel(apt.id)"
            >
              <X class="w-4 h-4" />
              取消预约
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredAppointments.length === 0" class="text-center py-16">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar class="w-10 h-10 text-gray-300" />
        </div>
        <p class="text-gray-500 mb-2">暂无预约记录</p>
        <p class="text-sm text-gray-400">快去预约心仪的医生吧～</p>
      </div>
    </div>
  </div>
</template>
