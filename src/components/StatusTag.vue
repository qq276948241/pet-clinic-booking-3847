<script setup lang="ts">
import type { AppointmentStatus } from '@/types'
import { StatusLabels, StatusColors } from '@/types'

defineProps<{
  status: AppointmentStatus
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
    :class="StatusColors[status]"
  >
    {{ StatusLabels[status] }}
  </span>
</template>
