<template>
  <div v-if="visible" class="fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 flex flex-col">
    <div class="flex items-center justify-between p-4 border-b">
      <h2 class="text-lg font-semibold">Notifications</h2>
      <GlobalButton icon="pi pi-times" @click="close" class="p-button-text" />
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center text-gray-500">Loading notifications...</div>
      <div v-else>
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-400">No notifications</div>
        <ul>
          <li
            v-for="notif in notifications"
            :key="notif.id"
            :class="[
              'border-b px-4 py-3 flex flex-col gap-1 transition-colors',
              notif.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50'
            ]"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-sm text-gray-900">{{ notif.title }}</p>
                <p class="text-sm text-gray-600">{{ notif.body }}</p>
              </div>
              <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatDate(notif.created_at) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span :class="['px-2 py-0.5 rounded-full font-medium', typeBadgeClass(notif.type)]">
                {{ formatType(notif.type) }}
              </span>
              <span :class="readStatusClass(notif.is_read)">{{ notif.is_read ? 'Read' : 'Unread' }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import type { Notification } from '@/composables/useNotifications'

const props = defineProps<{ visible: boolean, notifications: Notification[], loading?: boolean }>()
const loading = computed(() => props.loading ?? false)
const emit = defineEmits(['close'])

const close = () => emit('close')

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}
function formatType(type: Notification['type']) {
  return type.replace(/_/g, ' ')
}

function typeBadgeClass(type: Notification['type']) {
  const map: Record<string, string> = {
    CERTIFICATE_EXPIRING: 'bg-amber-100 text-amber-700',
    CERTIFICATE_EXPIRED: 'bg-red-100 text-red-700'
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

function readStatusClass(isRead: boolean) {
  return isRead ? 'text-gray-400' : 'text-blue-600 font-semibold'
}
</script>

<style scoped>
.fixed {
  transition: right 0.3s cubic-bezier(0.4,0,0.2,1);
}
</style>
