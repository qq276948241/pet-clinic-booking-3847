export interface Doctor {
  id: number
  name: string
  avatar: string
  department: string
  title: string
  totalSlots: number
  bookedSlots: number
  onDutyDays: string[]
}

export type PetType = 'cat' | 'dog' | 'rabbit' | 'exotic'

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  doctorId: number
  doctorName: string
  date: string
  time: string
  petType: PetType
  petName: string
  ownerPhone: string
  description: string
  status: AppointmentStatus
  createdAt: string
}

export interface AppointmentForm {
  date: string
  doctorId: number | null
  petType: PetType | null
  petName: string
  ownerPhone: string
  description: string
}

export const PetTypeLabels: Record<PetType, string> = {
  cat: '猫',
  dog: '狗',
  rabbit: '兔子',
  exotic: '异宠',
}

export const PetTypeEmojis: Record<PetType, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  exotic: '🦜',
}

export const StatusLabels: Record<AppointmentStatus, string> = {
  pending: '待就诊',
  completed: '已完成',
  cancelled: '已取消',
}

export const StatusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-gray-100 text-gray-500',
}
