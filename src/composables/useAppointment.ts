import { ref, computed, reactive } from 'vue'
import type { Appointment, Doctor } from '@/types'
import { mockAppointments, mockDoctors } from '@/data/mock'
import {
  getAppointments as loadAppointmentsFromStorage,
  saveAppointments as persistAppointments,
  getAllDoctorBookedDeltas,
  setAllDoctorBookedDeltas,
  generateAppointmentId,
  type DoctorSlotDeltaMap,
} from '@/utils/storage'

const appointments = ref<Appointment[]>([])
const bookedDeltas = reactive<DoctorSlotDeltaMap>({})
let initialized = false

export interface CreateAppointmentParams {
  doctorId: number
  doctorName: string
  date: string
  time: string
  petType: Appointment['petType']
  petName: string
  ownerPhone: string
  description: string
}

export function useAppointment() {
  function ensureInitialized() {
    if (!initialized) {
      initialized = true
      syncFromStorage()
    }
  }

  function syncFromStorage() {
    const stored = loadAppointmentsFromStorage()
    if (stored.length === 0 && mockAppointments.length > 0) {
      appointments.value = [...mockAppointments]
      persistAppointments(mockAppointments)
    } else {
      appointments.value = stored
    }

    const deltas = getAllDoctorBookedDeltas()
    for (const k of Object.keys(bookedDeltas)) {
      delete bookedDeltas[Number(k)]
    }
    for (const [k, v] of Object.entries(deltas)) {
      bookedDeltas[Number(k)] = v
    }
  }

  function persistDeltas() {
    setAllDoctorBookedDeltas({ ...bookedDeltas })
  }

  function getDoctorById(id: number): Doctor | undefined {
    return mockDoctors.find((d) => d.id === id)
  }

  function getDoctorRemainingSlots(doctorId: number): number {
    ensureInitialized()
    const doctor = getDoctorById(doctorId)
    if (!doctor) return 0
    const delta = bookedDeltas[doctorId] ?? 0
    const actualBooked = doctor.bookedSlots + delta
    return Math.max(0, doctor.totalSlots - actualBooked)
  }

  function getTotalRemainingSlots(doctors: Pick<Doctor, 'id' | 'bookedSlots' | 'totalSlots'>[]): number {
    ensureInitialized()
    return doctors.reduce((sum, doc) => {
      const delta = bookedDeltas[doc.id] ?? 0
      const actualBooked = doc.bookedSlots + delta
      return sum + Math.max(0, doc.totalSlots - actualBooked)
    }, 0)
  }

  function addAppointment(params: CreateAppointmentParams): Appointment {
    ensureInitialized()
    const apt: Appointment = {
      id: generateAppointmentId(),
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      date: params.date,
      time: params.time,
      petType: params.petType,
      petName: params.petName,
      ownerPhone: params.ownerPhone,
      description: params.description,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }

    appointments.value = [apt, ...appointments.value]
    persistAppointments(appointments.value)

    bookedDeltas[params.doctorId] = (bookedDeltas[params.doctorId] ?? 0) + 1
    persistDeltas()

    return apt
  }

  function cancelAppointment(id: string): Appointment | null {
    ensureInitialized()
    const index = appointments.value.findIndex((a) => a.id === id)
    if (index === -1 || appointments.value[index].status !== 'pending') {
      return null
    }

    const target = appointments.value[index]
    const cancelled: Appointment = { ...target, status: 'cancelled' }
    appointments.value = [
      ...appointments.value.slice(0, index),
      cancelled,
      ...appointments.value.slice(index + 1),
    ]
    persistAppointments(appointments.value)

    bookedDeltas[target.doctorId] = (bookedDeltas[target.doctorId] ?? 0) - 1
    persistDeltas()

    return cancelled
  }

  const pendingCount = computed(() =>
    appointments.value.filter((a) => a.status === 'pending').length
  )

  const pendingAppointments = computed(() =>
    appointments.value.filter((a) => a.status === 'pending')
  )

  ensureInitialized()

  return {
    appointments,
    pendingCount,
    pendingAppointments,
    refresh: syncFromStorage,
    addAppointment,
    cancelAppointment,
    getDoctorRemainingSlots,
    getTotalRemainingSlots,
  }
}
