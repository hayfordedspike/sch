import { computed, ref } from 'vue'
import { useAuthStore, type User } from '@/stores/auth'

const currentUser = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const hasFetched = ref(false)

export function useCurrentUser() {
  const authStore = useAuthStore()

  const fetchCurrentUser = async (force = false) => {
    const alreadyLoaded = hasFetched.value && currentUser.value && !force
    if (alreadyLoaded) {
      return currentUser.value
    }

    loading.value = true
    error.value = null

    try {
      let profile = authStore.getUser()
      const needsFetch = force || !profile || !profile.id || profile.id === 0

      if (needsFetch) {
        profile = await authStore.fetchUserProfile()
      }

      if (profile) {
        currentUser.value = profile
      }

      hasFetched.value = true
      return currentUser.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch current user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    currentUser,
    loading,
    error,
    hasLoaded: computed(() => hasFetched.value),
    fetchCurrentUser
  }
}
