<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, User, Phone, PawPrint, FileText, ChevronDown, CheckCircle } from 'lucide-vue-next'
import { mockDoctors, getTodayDateString, formatDateDisplay } from '@/data/mock'
import { addAppointment, generateAppointmentId } from '@/utils/storage'
import { PetTypeLabels, PetTypeEmojis } from '@/types'
import type { AppointmentForm, PetType, Doctor } from '@/types'

const route = useRoute()
const router = useRouter()

const today = getTodayDateString()
const availableDates = computed(() => {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
})

const form = reactive<AppointmentForm>({
  date: today,
  doctorId: null,
  petType: null,
  petName: '',
  ownerPhone: '',
  description: '',
})

const availableDoctors = computed(() =>
  mockDoctors.filter((doc) => doc.onDutyDays.includes(form.date))
)

const availableTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
const selectedTime = ref('09:00')

const showSuccess = ref(false)

const petTypes: PetType[] = ['cat', 'dog', 'rabbit', 'exotic']

const isFormValid = computed(() => {
  return (
    form.date &&
    form.doctorId !== null &&
    form.petType !== null &&
    form.petName.trim() !== '' &&
    /^1[3-9]\d{9}$/.test(form.ownerPhone)
  )
})

watch(
  () => route.query,
  (query) => {
    if (query.doctorId) {
      form.doctorId = Number(query.doctorId)
    }
    if (query.date) {
      form.date = String(query.date)
    }
  },
  { immediate: true }
)

const selectedDoctor = computed(() =>
  mockDoctors.find((d) => d.id === form.doctorId)
)

function getDoctorName(doctorId: number | null): string {
  if (!doctorId) return '请选择医生'
  const doc = mockDoctors.find((d) => d.id === doctorId)
  return doc ? `${doc.name} - ${doc.department}` : '请选择医生'
}

function submitForm() {
  if (!isFormValid.value) return

  const doctor = mockDoctors.find((d) => d.id === form.doctorId)
  if (!doctor || !form.petType) return

  const appointment = {
    id: generateAppointmentId(),
    doctorId: form.doctorId!,
    doctorName: doctor.name,
    date: form.date,
    time: selectedTime.value,
    petType: form.petType,
    petName: form.petName.trim(),
    ownerPhone: form.ownerPhone,
    description: form.description.trim(),
    status: 'pending' as const,
    createdAt: new Date().toISOString().split('T')[0],
  }

  addAppointment(appointment)
  showSuccess.value = true

  setTimeout(() => {
    router.push('/records')
  }, 1500)
}
</script>

<template>
  <div class="flex-1 pb-24">
    <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="bg-white rounded-2xl p-8 mx-4 text-center shadow-2xl animate-bounce-in">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-8 h-8 text-primary-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">预约成功！</h3>
        <p class="text-gray-500 text-sm">即将跳转到预约记录...</p>
      </div>
    </div>

    <div class="max-w-md mx-auto px-4 py-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">预约挂号</h2>

      <div class="space-y-5">
        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar class="w-4 h-4 text-primary-500" />
            选择日期
          </label>
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              v-for="date in availableDates"
              :key="date"
              class="flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all duration-200"
              :class="
                form.date === date
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-primary-50'
              "
              @click="form.date = date; form.doctorId = null"
            >
              <div class="text-xs opacity-80">{{ formatDateDisplay(date).split(' ')[1] }}</div>
              <div class="text-sm font-bold">{{ formatDateDisplay(date).split(' ')[0] }}</div>
            </button>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User class="w-4 h-4 text-primary-500" />
            选择医生
          </label>
          <div class="relative">
            <select
              v-model="form.doctorId"
              class="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
            >
              <option :value="null" disabled>请选择医生</option>
              <option
                v-for="doc in availableDoctors"
                :key="doc.id"
                :value="doc.id"
              >
                {{ doc.name }} - {{ doc.department }}（剩余{{ doc.totalSlots - doc.bookedSlots }}号）
              </option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          <div v-if="availableDoctors.length === 0" class="text-amber-600 text-sm mt-2">
            该日期暂无值班医生，请选择其他日期
          </div>
        </div>

        <div v-if="selectedDoctor">
          <div class="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <div class="flex items-center gap-3">
              <img
                :src="selectedDoctor.avatar"
                :alt="selectedDoctor.name"
                class="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
              />
              <div>
                <div class="font-bold text-gray-800">{{ selectedDoctor.name }}</div>
                <div class="text-sm text-gray-600">{{ selectedDoctor.title }} · {{ selectedDoctor.department }}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <PawPrint class="w-4 h-4 text-primary-500" />
            宠物类型
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="type in petTypes"
              :key="type"
              class="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200"
              :class="
                form.petType === type
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-primary-50'
              "
              @click="form.petType = type"
            >
              <span class="text-xl">{{ PetTypeEmojis[type] }}</span>
              <span class="text-xs font-medium">{{ PetTypeLabels[type] }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            选择时段
          </label>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="time in availableTimes"
              :key="time"
              class="py-2 text-sm rounded-lg transition-all duration-200"
              :class="
                selectedTime === time
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-primary-50'
              "
              @click="selectedTime = time"
            >
              {{ time }}
            </button>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            宠物姓名
          </label>
          <input
            v-model="form.petName"
            type="text"
            placeholder="请输入宠物姓名"
            class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone class="w-4 h-4 text-primary-500" />
            联系电话
          </label>
          <input
            v-model="form.ownerPhone"
            type="tel"
            placeholder="请输入11位手机号"
            maxlength="11"
            class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
          />
          <div v-if="form.ownerPhone && !/^1[3-9]\d{9}$/.test(form.ownerPhone)" class="text-red-500 text-sm mt-1">
            请输入正确的手机号
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText class="w-4 h-4 text-primary-500" />
            病情描述（选填）
          </label>
          <textarea
            v-model="form.description"
            placeholder="请简要描述宠物症状..."
            rows="3"
            class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all resize-none"
          />
        </div>

        <button
          class="w-full py-4 rounded-full font-bold text-white text-base transition-all duration-200 mt-4"
          :class="
            isFormValid
              ? 'bg-primary-500 hover:bg-primary-600 active:scale-98 shadow-lg shadow-primary-200'
              : 'bg-gray-300 cursor-not-allowed'
          "
          :disabled="!isFormValid"
          @click="submitForm"
        >
          确认预约
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
</style>
