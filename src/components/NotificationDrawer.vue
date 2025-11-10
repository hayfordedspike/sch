<template>
  <div v-if="visible" class="fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 flex flex-col">
    <div class="flex items-center justify-between p-4 border-b">
      <h2 class="text-lg font-semibold">Notifications</h2>
      <Button icon="pi pi-times" @click="close" class="p-button-text" />
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center text-gray-500">Loading...</div>
      <div v-else>
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-400">No notifications</div>
        <ul>
          <li v-for="notif in notifications" :key="notif.id" class="border-b px-4 py-3 hover:bg-gray-50 flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <span class="font-medium text-sm">{{ notif.channel }}</span>
              <span class="text-xs text-gray-400">{{ formatDate(notif.created_at) }}</span>
            </div>
            <div class="text-xs text-gray-600">Status: <span :class="statusClass(notif.status)">{{ notif.status }}</span></div>
            <div v-if="notif.error_message" class="text-xs text-red-500">Error: {{ notif.error_message }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import Button from 'primevue/button'

interface Notification {
  id: string | number
  channel: string
  created_at: string
  status: string
  error_message?: string
}

const { visible, notifications } = defineProps<{ visible: boolean, notifications: Notification[] }>()
const emit = defineEmits(['close'])

const loading = false

const close = () => emit('close')

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}
function statusClass(status: string) {
  if (status === 'PENDING') return 'text-yellow-600'
  if (status === 'SENT') return 'text-green-600'
  if (status === 'FAILED') return 'text-red-600'
  return 'text-gray-600'
}
</script>

<style scoped>
.fixed {
  transition: right 0.3s cubic-bezier(0.4,0,0.2,1);
}
</style>
