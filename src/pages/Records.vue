<script setup lang="ts">
import { ref, computed, onActivated, onMounted } from 'vue'
import { Calendar, Clock, Phone, X, FileText, AlertCircle, CheckCircle } from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import { useAppointment } from '@/composables/useAppointment'
import { formatDateDisplay } from '@/data/mock'
import { PetTypeLabels, PetTypeEmojis } from '@/types'
import type { Appointment } from '@/types'

const { appointments, pendingCount, cancelAppointment, refresh } = useAppointment()

const activeTab = ref<'all' | 'pending'>('all')

const filteredAppointments = computed(() => {
  if (activeTab.value === 'pending') {
    return appointments.value.filter((a) => a.status === 'pending')
  }
  return appointments.value
})

onMounted(refresh)
onActivated(refresh)

const showCancelConfirm = ref(false)
const cancelTarget = ref<Appointment | null>(null)

const showToast = ref(false)
const toastMessage = ref('')

function confirmCancel(apt: Appointment) {
  cancelTarget.value = apt
  showCancelConfirm.value = true
}

function handleCancel() {
  if (cancelTarget.value) {
    const result = cancelAppointment(cancelTarget.value.id)
    if (result) {
      toastMessage.value = `已取消预约，${result.doctorName}的号源已退还`
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, 2500)
    }
  }
  showCancelConfirm.value = false
  cancelTarget.value = null
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
    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-2 border border-primary-100"
      >
        <CheckCircle class="w-5 h-5 text-primary-500 flex-shrink-0" />
        <span class="text-sm text-gray-700 font-medium">{{ toastMessage }}</span>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showCancelConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle class="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">确认取消预约</h3>
            </div>
          </div>

          <div v-if="cancelTarget" class="bg-gray-50 rounded-xl p-4 mb-2">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">医生</span>
                <span class="font-medium text-gray-800">{{ cancelTarget.doctorName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">时间</span>
                <span class="font-medium text-gray-800">
                  {{ formatDateDisplay(cancelTarget.date) }} {{ cancelTarget.time }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">宠物</span>
                <span class="font-medium text-gray-800">
                  {{ PetTypeEmojis[cancelTarget.petType] }} {{ cancelTarget.petName }}
                </span>
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-500 mb-1">
            取消后号源将自动退还，确定要取消这个预约吗？
          </p>

          <div class="flex gap-3 mt-5">
            <button
              class="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              @click="showCancelConfirm = false; cancelTarget = null"
            >
              再想想
            </button>
            <button
              class="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 active:scale-98 transition-all"
              @click="handleCancel"
            >
              确认取消
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
          class="bg-white rounded-2xl p-4 shadow-card border border-gray-50 relative"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0 pr-2">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-800">{{ apt.doctorName }}</span>
                <StatusTag :status="apt.status" />
              </div>
              <div class="text-xs text-gray-400">{{ apt.id }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="apt.status === 'pending'"
                class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 active:scale-95 transition-all flex-shrink-0"
                title="取消预约"
                @click="confirmCancel(apt)"
              >
                <X class="w-4 h-4" />
              </button>
              <span class="text-2xl flex-shrink-0">{{ PetTypeEmojis[apt.petType] }}</span>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-600">
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
