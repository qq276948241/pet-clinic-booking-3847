import type { Appointment } from '@/types'

const STORAGE_KEY = 'pet_hospital_appointments'

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

export function addAppointment(appointment: Appointment): void {
  const appointments = getAppointments()
  appointments.unshift(appointment)
  saveAppointments(appointments)
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

export function generateAppointmentId(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `APT${dateStr}${random}`
}
