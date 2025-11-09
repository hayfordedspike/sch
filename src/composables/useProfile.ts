import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { useAuthStore } from '../stores/auth'

export interface UserProfile {
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superuser: boolean
  id: number
  created_at: string
  updated_at: string
  last_login: string
}

export interface UpdateProfileData {
  email?: string
  first_name?: string
  last_name?: string
}

export function useProfile() {
  const { get, patch } = useApi()
  const authStore = useAuthStore()
  
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties for easy access
  const fullName = computed(() => {
    if (!profile.value) return ''
    return `${profile.value.first_name} ${profile.value.last_name}`.trim()
  })

  const initials = computed(() => {
    if (!profile.value) return ''
    const first = profile.value.first_name?.[0] || ''
    const last = profile.value.last_name?.[0] || ''
    return `${first}${last}`.toUpperCase()
  })

  // Fetch current user profile
  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      // Get user ID from auth store
      const currentUser = authStore.getUser()
      if (!currentUser?.id) {
        error.value = 'User not authenticated'
        loading.value = false
        return
      }

      console.log('Fetching profile for user ID:', currentUser.id)
      
      const data = await get<UserProfile>(`/users/${currentUser.id}`, {
        showErrorToast: true,
        customErrorHandler: (err: unknown) => {
          const axiosError = err as { response?: { status?: number; data?: unknown } }
          console.error('Profile fetch error:', axiosError.response?.status, axiosError.response?.data)
          if (axiosError.response?.status === 401) {
            authStore.logout()
          }
        }
      })

      if (data) {
        profile.value = data
        // Update auth store with fresh user data
        authStore.setUser({
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          is_active: data.is_active,
          is_superuser: data.is_superuser
        })
      }
    } catch (err) {
      error.value = 'Failed to fetch profile'
      console.error('Profile fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (data: UpdateProfileData) => {
    loading.value = true
    error.value = null

    try {
      // Get user ID from auth store
      const currentUser = authStore.getUser()
      if (!currentUser?.id) {
        error.value = 'User not authenticated'
        loading.value = false
        return false
      }

      console.log('Updating profile for user ID:', currentUser.id)
      
      const updatedProfile = await patch<UserProfile>(`/users/${currentUser.id}`, data, {
        showSuccessToast: true,
        successMessage: 'Profile updated successfully',
        showErrorToast: true
      })

      if (updatedProfile) {
        profile.value = updatedProfile
        // Update auth store with updated user data
        authStore.setUser({
          id: updatedProfile.id,
          email: updatedProfile.email,
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          is_active: updatedProfile.is_active,
          is_superuser: updatedProfile.is_superuser
        })
        return true
      }
      return false
    } catch (err) {
      error.value = 'Failed to update profile'
      console.error('Profile update error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Initialize profile data from auth store if available
  const initializeFromAuth = () => {
    const user = authStore.user
    if (user && !profile.value) {
      profile.value = {
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active,
        is_superuser: user.is_superuser,
        id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
    }
  }

  return {
    profile,
    loading,
    error,
    fullName,
    initials,
    fetchProfile,
    updateProfile,
    initializeFromAuth
  }
}