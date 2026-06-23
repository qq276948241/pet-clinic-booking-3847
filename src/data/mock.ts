import type { Doctor, Appointment } from '@/types'

function getDateString(offset: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().split('T')[0]
}

export const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: '张医生',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20veterinarian%20doctor%20portrait%20friendly%20smile%20asian%20male%20white%20coat&image_size=square',
    department: '内科',
    title: '主治医师',
    totalSlots: 20,
    bookedSlots: 8,
    onDutyDays: [getDateString(0), getDateString(2), getDateString(4)],
  },
  {
    id: 2,
    name: '李医生',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20veterinarian%20doctor%20portrait%20friendly%20smile%20asian%20female%20white%20coat&image_size=square',
    department: '外科',
    title: '副主任医师',
    totalSlots: 15,
    bookedSlots: 13,
    onDutyDays: [getDateString(0), getDateString(1), getDateString(3)],
  },
  {
    id: 3,
    name: '王医生',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20veterinarian%20specialist%20portrait%20kind%20middle%20aged%20asian%20male%20white%20coat&image_size=square',
    department: '皮肤科',
    title: '主任医师',
    totalSlots: 10,
    bookedSlots: 10,
    onDutyDays: [getDateString(1), getDateString(2), getDateString(5)],
  },
  {
    id: 4,
    name: '陈医生',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20professional%20veterinarian%20portrait%20cheerful%20asian%20female%20white%20coat%20glasses&image_size=square',
    department: '异宠科',
    title: '主治医师',
    totalSlots: 12,
    bookedSlots: 3,
    onDutyDays: [getDateString(0), getDateString(3), getDateString(4)],
  },
  {
    id: 5,
    name: '刘医生',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=experienced%20veterinarian%20doctor%20portrait%20warm%20smile%20asian%20male%20white%20coat%20stethoscope&image_size=square',
    department: '眼科',
    title: '主治医师',
    totalSlots: 18,
    bookedSlots: 5,
    onDutyDays: [getDateString(0), getDateString(2), getDateString(5)],
  },
]

export const mockAppointments: Appointment[] = [
  {
    id: 'APT20260623001',
    doctorId: 1,
    doctorName: '张医生',
    date: getDateString(1),
    time: '09:00',
    petType: 'dog',
    petName: '豆豆',
    ownerPhone: '138****1234',
    description: '最近食欲不好，精神不佳',
    status: 'pending',
    createdAt: getDateString(-1),
  },
  {
    id: 'APT20260620002',
    doctorId: 2,
    doctorName: '李医生',
    date: getDateString(-3),
    time: '14:30',
    petType: 'cat',
    petName: '咪咪',
    ownerPhone: '138****1234',
    description: '皮肤瘙痒，经常抓挠',
    status: 'completed',
    createdAt: getDateString(-5),
  },
  {
    id: 'APT20260615003',
    doctorId: 4,
    doctorName: '陈医生',
    date: getDateString(-8),
    time: '10:00',
    petType: 'exotic',
    petName: '小绿',
    ownerPhone: '138****1234',
    description: '鹦鹉羽毛脱落',
    status: 'cancelled',
    createdAt: getDateString(-10),
  },
]

export function getDoctorsByDate(date: string): Doctor[] {
  return mockDoctors.filter((doc) => doc.onDutyDays.includes(date))
}

export function getTodayDateString(): string {
  return getDateString(0)
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 ${weekday}`
}
