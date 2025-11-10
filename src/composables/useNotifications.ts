import { ref } from 'vue'

export function useNotifications() {
  const notifications = ref([
    {
      channel: 'EMAIL',
      template_key: 'string',
      priority: 'MEDIUM',
      context: { additionalProp1: {} },
      id: 0,
      recipient_user_id: 0,
      status: 'PENDING',
      employee_certificate_id: 0,
      created_at: '2025-11-10T05:42:22.902Z',
      sent_at: '2025-11-10T05:42:22.902Z',
      read_at: '2025-11-10T05:42:22.902Z',
      error_message: 'string'
    }
  ])
  const loading = ref(false)

  function fetchNotifications() {
    // No-op for dummy data
    loading.value = false
  }

  return { notifications, loading, fetchNotifications }
}
