import { ref } from 'vue'
import { useApi } from './useApi'
import type { User } from '@/stores/auth'

export function useUsers() {
  const { get, loading, error } = useApi()
  const lastFetchedUsers = ref<User[]>([])

  const fetchUserByField = async (field: string, value: string): Promise<User[]> => {
    if (!field || !value) {
      lastFetchedUsers.value = []
      return []
    }

    const response = await get<User | User[]>(`/users/by-field/${field}?value=${encodeURIComponent(value)}`, {
      showErrorToast: true
    })

    if (response) {
      const users = Array.isArray(response) ? response : [response]
      lastFetchedUsers.value = users
      return users
    }

    lastFetchedUsers.value = []
    return []
  }

  const clearLastFetchedUsers = () => {
    lastFetchedUsers.value = []
  }

  return {
    loading,
    error,
    lastFetchedUsers,
    fetchUserByField,
    clearLastFetchedUsers
  }
}
