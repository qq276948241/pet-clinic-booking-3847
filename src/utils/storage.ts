import type { Appointment } from '@/types'

const STORAGE_KEY = 'pet_hospital_appointments'
const DOCTOR_SLOTS_KEY = 'pet_hospital_doctor_slots'

interface DoctorSlotDelta {
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

function getDoctorSlotDeltas(): DoctorSlotDelta {
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

function saveDoctorSlotDeltas(deltas: DoctorSlotDelta): void {
  try {
    localStorage.setItem(DOCTOR_SLOTS_KEY, JSON.stringify(deltas))
  } catch (e) {
    console.error('Failed to save doctor slot deltas:', e)
  }
}

export function getDoctorBookedDelta(doctorId: number): number {
  const deltas = getDoctorSlotDeltas()
  return deltas[doctorId] || 0
}

export function incrementDoctorBookedSlots(doctorId: number): void {
  const deltas = getDoctorSlotDeltas()
  deltas[doctorId] = (deltas[doctorId] || 0) + 1
  saveDoctorSlotDeltas(deltas)
}

export function decrementDoctorBookedSlots(doctorId: number): void {
  const deltas = getDoctorSlotDeltas()
  deltas[doctorId] = (deltas[doctorId] || 0) - 1
  saveDoctorSlotDeltas(deltas)
}

export function addAppointment(appointment: Appointment): void {
  const appointments = getAppointments()
  appointments.unshift(appointment)
  saveAppointments(appointments)
  incrementDoctorBookedSlots(appointment.doctorId)
}

export function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): void {
  const appointments = getAppointments()
  const index = appointments.findIndex((a) => a.id === id)
  if (index !== -1) {
    appointments[index].status = status
    saveAppointments(appointments)
  }
}

export function cancelAppointment(id: string): Appointment | null {
  const appointments = getAppointments()
  const index = appointments.findIndex((a) => a.id === id)
  if (index !== -1 && appointments[index].status === 'pending') {
    appointments[index].status = 'cancelled'
    saveAppointments(appointments)
    decrementDoctorBookedSlots(appointments[index].doctorId)
    return appointments[index]
  }
  return null
}

export function generateAppointmentId(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `APT${dateStr}${random}`
}
