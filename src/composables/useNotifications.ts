import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export type NotificationType = 'CERTIFICATE_EXPIRING' | 'CERTIFICATE_EXPIRED' | string

export interface Notification {
  id: number
  title: string
  body: string
  type: NotificationType
  is_read: boolean
  created_at: string
  user_id: number
}

export function useNotifications() {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const { get } = useApi()

  const fetchNotifications = async () => {
    loading.value = true

    try {
      const response = await get<Notification[]>('/notifications/', { showErrorToast: false })
      if (response) {
        notifications.value = response
      }
    } finally {
      loading.value = false
    }
  }

  return { notifications, loading, fetchNotifications }
}
