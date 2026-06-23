import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Appointment from '@/pages/Appointment.vue'
import Records from '@/pages/Records.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/appointment',
    name: 'appointment',
    component: Appointment,
  },
  {
    path: '/records',
    name: 'records',
    component: Records,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
