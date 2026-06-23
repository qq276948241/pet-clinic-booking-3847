import type { Appointment } from '@/types'

const STORAGE_KEY = 'pet_hospital_appointments'
const DOCTOR_SLOTS_KEY = 'pet_hospital_doctor_slots'

export type DoctorSlotDeltaMap = {
  [doctorId: number]: number
}

export function getAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load appointments:', e)
  }
  return []
}

export function saveAppointments(appointments: Appointment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
  } catch (e) {
    console.error('Failed to save appointments:', e)
  }
}

export function getAllDoctorBookedDeltas(): DoctorSlotDeltaMap {
  try {
    const data = localStorage.getItem(DOCTOR_SLOTS_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load doctor slot deltas:', e)
  }
  return {}
}

export function setAllDoctorBookedDeltas(deltas: DoctorSlotDeltaMap): void {
  try {
    localStorage.setItem(DOCTOR_SLOTS_KEY, JSON.stringify(deltas))
  } catch (e) {
    console.error('Failed to save doctor slot deltas:', e)
  }
}

export function generateAppointmentId(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `APT${dateStr}${random}`
}
